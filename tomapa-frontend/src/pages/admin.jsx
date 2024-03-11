import { useParams } from "react-router-dom";
import DBAdmin from "../components/admin/database";

const AdminPage = () => {
  const { page } = useParams();
  return <>{page == "database" ? <DBAdmin></DBAdmin> : <></>}</>;
};

export default AdminPage;
