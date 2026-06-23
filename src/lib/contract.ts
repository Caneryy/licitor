import * as StellarSdk from "@stellar/stellar-sdk";
import { classifyError } from "./errors";
import { config, rpc } from "./stellar";

const POLL_INTERVAL_MS = 1000;
const POLL_TIMEOUT_MS = 60_000;

export interface SubmitResult {
  hash: string;
  returnValue?: StellarSdk.xdr.ScVal;
}

export async function simulateAndPrepare(
  sourceAddress: string,
  contractId: string,
  method: string,
  args: StellarSdk.xdr.ScVal[],
): Promise<StellarSdk.Transaction> {
  const account = await rpc.getAccount(sourceAddress);
  const contract = new StellarSdk.Contract(contractId);

  let transaction = new StellarSdk.TransactionBuilder(account, {
    fee: StellarSdk.BASE_FEE,
    networkPassphrase: config.networkPassphrase,
  })
    .addOperation(contract.call(method, ...args))
    .setTimeout(180)
    .build();

  let simulation = await rpc.simulateTransaction(transaction);

  if (StellarSdk.rpc.Api.isSimulationRestore(simulation)) {
    throw new Error("contract_restore_required");
  }

  if (StellarSdk.rpc.Api.isSimulationError(simulation)) {
    throw new Error(simulation.error);
  }

  transaction = StellarSdk.rpc.assembleTransaction(transaction, simulation).build();
  return transaction;
}

export async function submitSignedTransaction(signedXdr: string): Promise<SubmitResult> {
  const transaction = StellarSdk.TransactionBuilder.fromXDR(
    signedXdr,
    config.networkPassphrase,
  ) as StellarSdk.Transaction;

  const hasSignature = transaction.signatures.some(
    (decorated) => decorated.signature().length > 0,
  );
  if (!hasSignature) {
    throw new Error("tx_not_signed");
  }

  const response = await rpc.sendTransaction(transaction);

  if (response.status === "ERROR") {
    throw new Error(`tx_submission_failed: ${response.errorResult?.toXDR("base64") ?? "unknown"}`);
  }

  const hash = response.hash;
  const started = Date.now();

  while (Date.now() - started < POLL_TIMEOUT_MS) {
    const result = await rpc.getTransaction(hash);
    if (result.status === "SUCCESS") {
      return { hash, returnValue: result.returnValue };
    }
    if (result.status === "FAILED") {
      throw new Error("tx_failed_on_chain");
    }
    await new Promise((resolve) => setTimeout(resolve, POLL_INTERVAL_MS));
  }

  throw new Error("tx_timeout");
}

export async function invokeContract(
  sourceAddress: string,
  contractId: string,
  method: string,
  args: StellarSdk.xdr.ScVal[],
  sign: (xdr: string, sourceAddress: string) => Promise<string>,
  onPhase?: (phase: "signing" | "submitting" | "confirming") => void,
): Promise<SubmitResult> {
  try {
    const prepared = await simulateAndPrepare(sourceAddress, contractId, method, args);
    onPhase?.("signing");
    if (prepared.source !== sourceAddress) {
      throw new Error("wallet_address_mismatch");
    }

    const signedXdr = await sign(prepared.toXDR(), sourceAddress);
    onPhase?.("submitting");
    onPhase?.("confirming");
    return await submitSignedTransaction(signedXdr);
  } catch (error) {
    throw classifyError(error);
  }
}

export async function simulateRead<T>(
  sourceAddress: string,
  contractId: string,
  method: string,
  args: StellarSdk.xdr.ScVal[],
  parse: (value: StellarSdk.xdr.ScVal | undefined) => T,
): Promise<T> {
  const account = await rpc.getAccount(sourceAddress);
  const contract = new StellarSdk.Contract(contractId);

  const transaction = new StellarSdk.TransactionBuilder(account, {
    fee: StellarSdk.BASE_FEE,
    networkPassphrase: config.networkPassphrase,
  })
    .addOperation(contract.call(method, ...args))
    .setTimeout(180)
    .build();

  const simulation = await rpc.simulateTransaction(transaction);

  if (StellarSdk.rpc.Api.isSimulationError(simulation)) {
    throw classifyError(new Error(simulation.error));
  }

  return parse(simulation.result?.retval);
}
