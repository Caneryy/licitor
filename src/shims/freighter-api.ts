import freighterApiPkg from "../../node_modules/@stellar/freighter-api/build/index.min.js";
import type FreighterApi from "../../node_modules/@stellar/freighter-api/build/@stellar/freighter-api/src/index";

const freighterApi = freighterApiPkg as typeof FreighterApi;

export const {
  WatchWalletChanges,
  addToken,
  getAddress,
  getNetwork,
  getNetworkDetails,
  isAllowed,
  isConnected,
  requestAccess,
  setAllowed,
  signAuthEntry,
  signMessage,
  signTransaction,
} = freighterApi;

export default freighterApi;
