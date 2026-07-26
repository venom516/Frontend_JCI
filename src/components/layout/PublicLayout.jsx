import Navbar from "./Navbar";

const PublicLayout = ({ children }) => {
  return (
    <div className="min-h-screen bg-background font-sans">
      <Navbar />
      {children}
    </div>
  );
};

export default PublicLayout;
