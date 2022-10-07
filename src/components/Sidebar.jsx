import { useState } from "react";
import { NavLink } from "react-router-dom";
import { RiCloseLine } from "react-icons/ri";
import { HiOutlineMenu } from "react-icons/hi";
import { logo } from "../assets";
import { links } from "../assets/constants";

const NavLinks = ({ handleClick }) => (
  <div className="mt-10">
    {links.map((item) => (
      <NavLink
        to={item.to}
        key={item.name}
        className="flex flex-row justify-start items-center my-8 text-sm font-medium text-gray-400 hover:text-cyan-400"
        onClick={() => handleClick && handleClick()}
      >
        <item.icon className="h-6 w-6 mr-2" />
        {item.name}
      </NavLink>
    ))}
  </div>
);

const Sidebar = () => {
  const [mobileMenue, setMobileMenue] = useState(false);
  return (
    <>
      <div className="md:flex hidden flex-col w[280px] py-10 px-8 bg-[#191624]">
        <img src={logo} alt="logo" className="w-full h-40 rounded-full object-contain " />
        <NavLinks />
      </div>
      {/* mobile */}
      <div className="absolute md:hidden block top-6 right-3">
        {mobileMenue ? (
          <RiCloseLine
            className="w-6 h-6 text-white mr-2 cursor-pointer"
            onClick={() => setMobileMenue(false)}
          />
        ) : (
          <HiOutlineMenu
            className="w-6 h-6 text-white mr-2 cursor-pointer"
            onClick={() => setMobileMenue(true)}
          />
        )}
      </div>
      <div
        className={`absolute top-0 h-screen w-2/3 bg-gradient-to-tl from-white/10 to-[#483c8b] backdrop-blur-lg z-10 p-6 md:hidden smooth-transition ${
          mobileMenue ? "left-0" : "-left-full"
        }`}
      >
        <img src={logo} alt="logo" className="w-full h-14 object-contain" />
        <NavLinks handleClick={() => setMobileMenue(false)} />
      </div>
    </>
  );
};

export default Sidebar;
