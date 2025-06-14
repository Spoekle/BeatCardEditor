import React, { useEffect, useRef, useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import logo from '/src/images/logo_500px.png';
import { FaGithub } from 'react-icons/fa';

const NavBar = () => {
    const navRef = useRef<HTMLDivElement>(null);
    const [underlineStyle, setUnderlineStyle] = useState<React.CSSProperties>({});
    const location = useLocation();
    const currentPath = location.pathname;

    useEffect(() => {
        const activeLink = navRef.current?.querySelector('.active') as HTMLElement | null;
        if (activeLink) {
            const { offsetLeft, offsetWidth } = activeLink;
            setUnderlineStyle({
                left: offsetLeft,
                width: offsetWidth,
                background: '#171717',
                position: 'absolute',
                bottom: -18,
                transition: 'all 200ms ease'
            });
        }
    }, [currentPath]);

    return (
        <nav className="w-full flex bg-neutral-950 text-white items-center">
            <div className="container mx-auto flex items-center justify-between h-20 px-4">
                <a href="/" className="text-lg font-semibold text-indigo-500">
                    <div className="flex items-center space-x-2">
                        <img src={logo} alt="logo" className="w-10 h-10 rounded-md" />
                        <h2 className="hidden sm:block text-xl font-semibold text-indigo-500">BeatCard Editor</h2>
                    </div>
                </a>
                <div className="relative flex space-x-2 items-center" ref={navRef}>
                    <NavLink
                        to="/editor"
                        className={({ isActive }) =>
                            `z-20 text-lg p-2 px-4 font-bold rounded-full transition-all duration-200 ${isActive ? 'active text-indigo-500' : 'text-neutral-400'}`
                        }
                    >
                        Editor
                    </NavLink>
                    <a
                        href="https://github.com/Spoekle/genpass"
                        target="_blank"
                        rel="noreferrer"
                        className="mx-2 hover:scale-110 transition duration-200 cursor-pointer"
                    >
                        <FaGithub className="text-4xl" />
                    </a>
                    <div className="absolute bottom-0 h-20" style={underlineStyle} />
                </div>
            </div>
        </nav>
    );
};

export default NavBar;