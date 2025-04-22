import { Suspense } from "react";
import AddMutualFund from "./AddMutualFund";

export default function Page() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <AddMutualFund />
    </Suspense>
  );
}
