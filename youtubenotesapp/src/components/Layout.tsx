import { Outlet } from "react-router-dom";
import Header from "./Navbar/Header";

export default function Layout() {
  return (
    <div className="bg-black min-h-screen">
        <Header />
        <div className="pt-16">
          <Outlet />
        </div>
    </div>
  )
}
