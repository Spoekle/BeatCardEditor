import { Link } from 'react-router-dom';

const Footer = () => {

    return (
        <footer className="absolute bottom-0 bg-neutral-900 w-full justify-between text-white py-6 text-center">
            <div className="container grid mx-auto justify-center px-4 items-center">
                <p className="flex text-md">
                    © {new Date().getFullYear()} Spoekle. All rights reserved.
                    <Link to="/privacy" className='ml-2 underline text-indigo-500 hover:text-blurple-dark transition duration-200'>
                        Privacy Statement
                    </Link>
                </p>
            </div>
        </footer>
    );
}

export default Footer;