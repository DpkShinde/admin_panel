import { Suspense } from "react";
import AddCompany from "./AddCompany";

export default function Page() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <AddCompany />
    </Suspense>
  );
}
