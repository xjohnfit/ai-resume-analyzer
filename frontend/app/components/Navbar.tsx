import { Form, Link } from "react-router";

const Navbar = () => {
    return (
        <nav className="navbar">
            <Link to="/dashboard">
                <p className="text-2xl font-bold text-gradient">APPLYZE</p>
            </Link>
            <div className="flex items-center gap-3">
                <Link to="/upload" className="primary-button w-fit">Upload Resume</Link>
                <Form method="post" action="/logout" className="w-fit">
                    <button type="submit" className="secondary-button">Logout</button>
                </Form>
            </div>
        </nav>
    );
};

export default Navbar;
