import { Form, Link } from "react-router";
import { Home, User, LogOut, Lightbulb } from "lucide-react";

const Navbar = () => {
    return (
        <nav className="navbar hidden md:flex">
            <Link to="/dashboard">
                <p className="text-2xl font-bold text-gradient">APPLYZE</p>
            </Link>
            <div className="flex items-center gap-3">
                <Link to="/" className="secondary-button">
                    <Home className="h-4 w-4" />
                    Home
                </Link>
                <Link to="/profile" className="secondary-button">
                    <User className="h-4 w-4" />
                    Profile
                </Link>
                <Link to="/patterns" className="secondary-button">
                    <Lightbulb className="h-4 w-4" />
                    Patterns
                </Link>
                <Form method="post" action="/logout" className="w-fit">
                    <button type="submit" className="secondary-button logout-button">
                        <LogOut className="h-4 w-4" />
                        Logout
                    </button>
                </Form>
            </div>
        </nav>
    );
};

export default Navbar;
