const Header = () => {
  return (
    <header className="flex items-center justify-center h-[10%] bg-[#202020] text-white">
        <ul className="min-w-[640px] w-[50%] flex items-center justify-evenly space-x-4 h-full ">
          <li>
            <a href="#" className="hover:bg-gray-700 hover:text-white px-6 py-4 rounded-xl">
              Home
            </a>
          </li>
          <li>
            <a href="#" className="hover:bg-gray-700 hover:text-white px-6 py-4 rounded-xl">
              About
            </a>
          </li>
          <li>
            <a href="#" className="hover:bg-gray-700 hover:text-white px-6 py-4 rounded-xl">
              Contact
            </a>
          </li>
          <li>
            <a href="#" className="hover:bg-gray-700 hover:text-white px-6 py-4 rounded-xl">
              Contact
            </a>
          </li>
        </ul>
    </header>

  );
};

export default Header;
