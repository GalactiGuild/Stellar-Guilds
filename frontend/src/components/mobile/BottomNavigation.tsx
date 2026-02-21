import { NavLink } from "react-router-dom";

const BottomNavigation = () => {
  return (
    <nav className="bottom-nav">
      <NavLink to="/">Home</NavLink>
      <NavLink to="/wallet">Wallet</NavLink>
      <NavLink to="/transactions">Transactions</NavLink>
      <NavLink to="/profile">Profile</NavLink>
    </nav>
  );
};

export default BottomNavigation;