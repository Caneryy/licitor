import { useEffect, useRef } from "react";
import { stroopsToXlm } from "../../lib/format";

interface AnimatedHighestBidProps {
  amount: bigint;
}

export function AnimatedHighestBid({ amount }: AnimatedHighestBidProps) {
  const previousRef = useRef(amount);
  const elementRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (amount === previousRef.current) return;

    previousRef.current = amount;
    const element = elementRef.current;
    if (!element) return;

    element.classList.remove("highest-bid-flash");
    void element.offsetWidth;
    element.classList.add("highest-bid-flash");

    const timer = window.setTimeout(() => {
      element.classList.remove("highest-bid-flash");
    }, 1200);

    return () => window.clearTimeout(timer);
  }, [amount]);

  return (
    <span ref={elementRef} className="inline-block font-black">
      {stroopsToXlm(amount)} XLM
    </span>
  );
}
