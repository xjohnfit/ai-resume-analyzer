import { useState } from "react";
import { Form, Link } from "react-router";
import { Home, User, LogOut, Menu, X, Lightbulb } from "lucide-react";

const MobileNavbar = () => {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <div className="relative w-full md:hidden">
            <nav className="navbar mx-4 w-auto">
                <Link to="/dashboard" onClick={() => setIsOpen(false)}>
                    <p className="text-2xl font-bold text-gradient">APPLYZE</p>
                </Link>
                <button
                    type="button"
                    onClick={() => setIsOpen((open) => !open)}
                    className="secondary-button"
                    aria-label={isOpen ? "Close menu" : "Open menu"}
                    aria-expanded={isOpen}
                >
                    {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
                </button>
            </nav>

            {isOpen && (
                <div className="animate-in fade-in slide-in-from-top-2 absolute inset-x-4 top-[calc(100%+0.5rem)] z-50 flex flex-col gap-2 rounded-2xl bg-white p-4 shadow-lg duration-200">
                    <Link to="/" className="secondary-button justify-start" onClick={() => setIsOpen(false)}>
                        <Home className="h-4 w-4" />
                        Home
                    </Link>
                    <Link to="/profile" className="secondary-button justify-start" onClick={() => setIsOpen(false)}>
                        <User className="h-4 w-4" />
                        Profile
                    </Link>
                    <Link to="/patterns" className="secondary-button justify-start" onClick={() => setIsOpen(false)}>
                        <Lightbulb className="h-4 w-4" />
                        Patterns
                    </Link>
                    <Form method="post" action="/logout">
                        <button type="submit" className="secondary-button logout-button w-full justify-start">
                            <LogOut className="h-4 w-4" />
                            Logout
                        </button>
                    </Form>
                </div>
            )}
        </div>
    );
};

export default MobileNavbar;
