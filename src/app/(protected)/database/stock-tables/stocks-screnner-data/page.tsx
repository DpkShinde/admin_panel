import AddStocks from "../stocks-screnner-data/add-stocks";
import EditStocks from "../stocks-screnner-data/edit-stocks";
import DisplayTable from "../stocks-screnner-data/display-table";

export default function Home() {
  return (
    <div>
      <h1>Add Stock Record</h1>
      <div className="ml-44">
        <DisplayTable />
      </div>
      {/* <EditStocks />
      <AddStocks /> */}
    </div>
  );
}
