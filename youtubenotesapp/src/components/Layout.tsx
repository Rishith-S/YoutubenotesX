import { Outlet } from "react-router-dom";
import Header from "./Navbar/Header";

export default function Layout() {
  return (
    <div className="bg-black fixed min-h-screen">
        <div><Header /></div>
        <div><Outlet /></div>
    </div>
  )
}
