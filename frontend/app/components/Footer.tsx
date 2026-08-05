import { Link, useRouteLoaderData } from "react-router";
import type { loader as rootLoader } from "~/root";

const Footer = () => {
    const rootData = useRouteLoaderData<typeof rootLoader>("root");
    const isAuthenticated = Boolean(rootData?.isAuthenticated);

    const productLinks = isAuthenticated
        ? [
            { to: "/dashboard", label: "Dashboard" },
            { to: "/profile", label: "Your profile" },
            { to: "/insights", label: "Insights" },
        ]
        : [{ to: "/#pricing", label: "Pricing" }];

    const accountLinks = isAuthenticated
        ? [
            { to: "/settings?section=billing", label: "Billing" },
            { to: "/settings", label: "Settings" },
        ]
        : [
            { to: "/login", label: "Log in" },
            { to: "/signup", label: "Sign up" },
        ];

    const supportLinks = isAuthenticated ? [{ to: "/contact", label: "Contact" }] : [];

    return (
        <footer className="w-full border-t border-gray-100 bg-white">
            <div className="mx-auto flex w-full max-w-300 flex-col gap-10 px-6 py-12 max-sm:mx-2 max-sm:items-center max-sm:text-center sm:flex-row sm:justify-between">
                <div className="flex max-w-xs flex-col gap-2 max-sm:items-center">
                    <Link to="/">
                        <p className="text-2xl font-bold text-gradient">APPLYZE</p>
                    </Link>
                    <p className="text-sm text-dark-200">
                        Maintain one master profile, generate tailored resumes for every application, and get
                        AI-powered, RAG-grounded resume feedback.
                    </p>
                </div>

                <div className="grid grid-cols-2 gap-8 max-sm:justify-items-center sm:flex sm:gap-16">
                    <div className="flex flex-col gap-2 max-sm:items-center">
                        <p className="text-sm font-semibold text-black">Product</p>
                        {productLinks.map((link) => (
                            <Link key={link.to} to={link.to} className="text-sm text-dark-200 hover:text-black">
                                {link.label}
                            </Link>
                        ))}
                    </div>
                    <div className="flex flex-col gap-2 max-sm:items-center">
                        <p className="text-sm font-semibold text-black">Account</p>
                        {accountLinks.map((link) => (
                            <Link key={link.to} to={link.to} className="text-sm text-dark-200 hover:text-black">
                                {link.label}
                            </Link>
                        ))}
                    </div>
                    {supportLinks.length > 0 && (
                        <div className="flex flex-col gap-2 max-sm:items-center">
                            <p className="text-sm font-semibold text-black">Support</p>
                            {supportLinks.map((link) => (
                                <Link key={link.to} to={link.to} className="text-sm text-dark-200 hover:text-black">
                                    {link.label}
                                </Link>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            <div className="border-t border-gray-100 px-6 py-6 text-center text-xs text-dark-200">
                &copy; {new Date().getFullYear()} Applyze. All rights reserved.
            </div>
        </footer>
    );
};

export default Footer;
