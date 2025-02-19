import { useState } from 'react';
import { Link } from 'react-router-dom';
import { FaInfo } from 'react-icons/fa';

const Footer = () => {
    const [expanded, setExpanded] = useState(false);

    return (
        <div className="fixed bottom-0 right-0 m-4 py-2 px-4 bg-white/10 backdrop-blur-lg rounded-xl ">
            {expanded ? (
                <footer
                    className="justify-between text-white  text-center cursor-pointer"
                    onClick={() => setExpanded(false)}
                >
                    <div className="container grid mx-auto justify-center items-center">
                        <p className="flex text-md">
                            © {new Date().getFullYear()} Spoekle. All rights reserved.
                            <Link
                                to="/privacy"
                                className="ml-2 underline text-indigo-500 hover:text-blurple-dark transition duration-200"
                            >
                                Privacy Statement
                            </Link>
                        </p>
                    </div>
                </footer>
            ) : (
                <div
                    className="text-white py-3 px-3 text-center cursor-pointer"
                    onClick={() => setExpanded(true)}
                >
                    <FaInfo/>
                </div>
            )}
        </div>
    );
}

export default Footer;