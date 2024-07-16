"use client"
import Link from 'next/link';
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from 'framer-motion';
import { usePathname, useRouter } from 'next/navigation';
import { Toaster, toast } from 'sonner';
import SearchModal from './SearchModal';
import CartModal from './CartModal';
import { CiSearch, CiUser, CiMenuBurger } from "react-icons/ci";
import { IoBagOutline } from "react-icons/io5";
import { RxCross1 } from "react-icons/rx";
import { MdOutlineKeyboardArrowRight } from "react-icons/md";
import BeatLoader from "react-spinners/BeatLoader";

function Navbar() {
  const [links, setLinks] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [activeLink, setActiveLink] = useState(null);
  const [activeSublink, setActiveSublink] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [logOut, setLogOut] = useState(true);
  const [isCartDrawerOpen, setIsCartDrawerOpen] = useState(false);
  const [results, setResults] = useState({ featured: [], type: [], collection: [] });
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMainPage, setIsMainPage] = useState(true);

  const path = usePathname();
  const router = useRouter();

  useEffect(() => {
    const getData = async () => {
      try {
        let res = await fetch('/api/navlink');
        res = await res.json();
        setLinks(res);
      } catch (err) {
        console.log(err);
      }
    }
    getData();
  }, [])

  const determineIsMainPage = (path) => {
    if (path === '/') {
      setIsMainPage(true);
    } else {
      setIsMainPage(false);
    }
  };

  // const logOutHandler = async() => {
  //   try{
  //     await signOut(auth)
  //     toast.success('User Logged Out!')
  //     setTimeout(() => {
  //       router.push('/')
  //     },1500)
  //   }catch(err){
  //     toast.error('User Logged Out!')
  //     console.error(err)
  //   }
  // }

  useEffect(() => {
    determineIsMainPage(path);

    const handleRouteChange = (url) => {
      determineIsMainPage(url);
    };

    router.events?.on('routeChangeComplete', handleRouteChange);

    return () => {
      router.events?.off('routeChangeComplete', handleRouteChange);
    };
  }, [path]);

  const toggle = () => {
    setIsOpen(!isOpen);
  };

  const toggleDrawer = () => {
    setIsDrawerOpen(!isDrawerOpen);
  };

  const toggleCartDrawer = () => {
    setIsCartDrawerOpen(!isCartDrawerOpen);
  };

  const handleClick = (index) => {
    if (activeLink === index) {
      setActiveLink(null);
    } else {
      setActiveLink(index);
      setActiveSublink(null);
    }
  };

  const handleSublinkClick = (index) => {
    setActiveSublink(index === activeSublink ? null : index);
  };

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 600) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  const handleSearch = async () => {
    if (!search) return;
    setLoading(true);
    try {
      const response = await fetch(`/api/search?query=${encodeURIComponent(search)}`);
      const data = await response.json();
      setResults(data);
    } catch (error) {
      console.error('Error fetching search results:', error);
    } finally {
      setLoading(false);
    }
  };

  const displayUniqueProducts = (products, uniqueTitles, category) => {
    return products.map((items, index) => {
      const uniqueProducts = items.product.filter((p) => {
        if (uniqueTitles.has(p.title)) {
          return false;
        } else {
          uniqueTitles.add(p.title);
          return true;
        }
      });

      return (
        uniqueProducts.length > 0 && (
          <div key={index} className="p-2">
            {uniqueProducts.map(item => (
              <div className='flex items-center cursor-pointer my-2' onClick={() => {
                router.push(`/${category}/${items.mainTitle}/${item._id}`);
                setResults({ featured: [], type: [], collection: [] });
                setSearch('')
                setIsOpen(!open);
              }}>
                <div>
                  <img src={item.img[0]} alt={item.title} className='h-20 w-20 border rounded-md mr-2' />
                </div>
                <p>{item.title}</p>
              </div>
            ))}
          </div>
        )
      );
    });
  };

  const uniqueTitles = new Set();

  const dynamicStyles = {
    navbar: `fixed top-0 md:flex justify-center text-black w-full transition-colors duration-300 z-50 ${isMainPage ? (isScrolled ? 'bg-white' : 'bg-transparent text-white') : 'bg-white'
      }`,
    menuItem: `${isScrolled ? 'underline-black' : ''} animated-underline py-9`,
    drawerContainer: "h-screen bg-white md:hidden text-black overscroll-none no-doc-scroll z-50",
    searchInput: "p-4 w-80 border-r-0 focus:outline-none",
    searchButton: "text-2xl px-4 py-2 bg-transparent hover:bg-gray-300",
    searchDeleteButton: "text-xl px-4 py-2 bg-transparent hover:bg-gray-300",
    nestedLink: "py-2 cursor-pointer",
    sublinkContainer: "pl-4",
    sublinkItem: "py-2 text-xs",
    submenuImagesContainer: 'flex gap-10 flex-wrap',
    submenuImage: 'w-28 h-28',
    navListItem: "py-3 cursor-pointer",
    footerLink: 'py-3 text-sm'
  };

  return (
    <div className={dynamicStyles.navbar}>
      <Toaster closeButton position="bottom-right" />
      <AnimatePresence>
        {isDrawerOpen && <SearchModal isOpen={isDrawerOpen} onClose={toggleDrawer} />}
        {isCartDrawerOpen && <CartModal isOpen={isCartDrawerOpen} onClose={toggleCartDrawer} />}
      </AnimatePresence>
      <nav className="md:w-11/12 flex items-center justify-between h-24 px-8 border-b">
        <ul className="hidden md:flex gap-6 z-50">
          <li className={`${dynamicStyles.menuItem} group relative`}>New in
            <ul className='w-[calc(90.7vw)] bg-white text-black h-72 hidden group-hover:flex absolute top-20 -left-8 mt-4 justify-between px-6 py-4'>
              {links.length > 0 && links[0].subLinks.map((link, i) => (
                <li key={i} className='font-semi-bold'>{link.title}
                  {link.sublink.map((l, j) => (
                    <Link href={l.url} key={j} className='block text-sm py-2 hover:underline underline-offset-2'>{l.title}</Link>
                  ))}
                </li>
              ))}
              <ul className='h-full flex gap-3 relative'>
                {links.length > 0 && links[0].images.map((img, i) => (
                  <div key={i} className='relative'>
                    <img src={img.img} alt={img.alt} className='w-64 h-full object-cover' />
                    <p className='absolute bottom-0 left-0 right-0 text-center text-white bg-black bg-opacity-50 py-2'>
                      {img.text}
                    </p>
                  </div>
                ))}
              </ul>

            </ul>
          </li>
          <li className={`${dynamicStyles.menuItem} group relative`}>Swimwear
            <ul className='w-[calc(90.7vw)] bg-white text-black h-80 hidden group-hover:flex absolute top-20 -left-[calc(106px)] mt-4 justify-evenly px-4 pt-4'>
              {links.length > 0 && links[1].images.map((img, i) => (
                <div key={i} className='relative'>
                  <img src={img.img} alt={img.alt} className='w-64 h-72 object-cover' />
                  <p className='absolute bottom-4 left-0 right-0 text-center text-white bg-black bg-opacity-50 py-2'>
                    {img.text}
                  </p>
                </div>
              ))}
            </ul>

          </li>
          <li className={dynamicStyles.menuItem}>look books</li>
          <li className={dynamicStyles.menuItem}>Blogs</li>
        </ul>

        <div className="md:hidden cursor-pointer" onClick={toggle}>
          {!isOpen ? <CiMenuBurger /> : <RxCross1 />}
        </div>

        {/* LOGO */}
        <p onClick={() => {
          if(isOpen){
            setIsOpen(false)
          }
          router.push('/')
        }} className='text-2xl font-semibold cursor-pointer'>Ecom</p>

        <div className='md:hidden text-2xl cursor-pointer' onClick={toggleCartDrawer}><IoBagOutline /></div>

        <ul className="hidden md:flex gap-6 group cursor-pointer">
          <li className={dynamicStyles.menuItem}>INR</li>
          <li className={dynamicStyles.menuItem}>Ethics</li>
          <li className={dynamicStyles.menuItem}>About</li>
          <li className="text-2xl py-9" onClick={toggleDrawer}><CiSearch /></li>
          <li className="text-2xl py-9"><Link href='/customer_login'><CiUser /></Link></li>
          <li className="text-2xl py-9" onClick={toggleCartDrawer}><IoBagOutline /></li>
        </ul>
      </nav>

      {isOpen && (
        <div className={dynamicStyles.drawerContainer}>
          <div className="flex flex-col items-center justify-between gap-10 relative">
            <div className="flex border hover:border-black justify-center mt-6">
              <input
                type="text"
                placeholder="Search"
                className={dynamicStyles.searchInput}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              <button className={dynamicStyles.searchButton} onClick={handleSearch}>
                <CiSearch />
              </button>
            </div>
            {results.featured.length > 0 || results.type.length > 0 || results.collection.length > 0 ?
              <div className="absolute top-28 flex flex-col items-center bg-black w-full">
                {loading ? (
                  <div className="flex justify-center items-center">
                    <BeatLoader loading={loading} size={10} color='white' aria-label="Loading Spinner" data-testid="loader" />
                  </div>
                ) : (
                  <>
                    {results.featured.length > 0 && (
                      <div className='p-4 bg-gray-200 w-10/12 my-2 rounded-md'>
                       <div className='flex justify-between px-4'>
                       <h3 className="font-bold text-lg">Featured</h3>
                       <button onClick={()=> {
                        setSearch('')
                        setResults({...results, featured: []})}}>X</button>
                       </div>
                        {displayUniqueProducts(results.featured, uniqueTitles, 'featured')}
                      </div>
                    )}
                    {results.type.length > 0 && (
                      <div>
                        <div className='flex justify-between px-4'>
                        <h3 className="font-bold text-lg">Type</h3>
                       <button onClick={()=> {
                        setSearch('')
                        setResults({...results, type: []})}}>X</button>
                       </div>
                        
                        {displayUniqueProducts(results.type, uniqueTitles, 'types')}
                      </div>
                    )}
                    {results.collection.length > 0 && (
                      <div>
                        <div className='flex justify-between px-4'>
                        <h3 className="font-bold text-lg">Collection</h3>
                       <button onClick={()=> {
                        setSearch('')
                        setResults({...results, collection: []})}}>X</button>
                       </div>
                        {displayUniqueProducts(results.collection, uniqueTitles, 'collections')}
                      </div>
                    )}
                    {results.featured.length === 0 && results.type.length === 0 && results.collection.length === 0 && (
                      <div>No results found</div>
                    )}
                  </>
                )}
              </div> : <></>
            }
            <div className="self-start px-6 w-full text-black">
              <ul>
                {links.length > 0 && links.map((link, index) => (
                  <li key={index} className={dynamicStyles.navListItem}>
                    <div className='flex items-center justify-between w-full' onClick={() => handleClick(index)}>
                      <div>
                        {link.title}
                      </div>
                      <MdOutlineKeyboardArrowRight />
                    </div>

                    <AnimatePresence>
                      {activeLink === index && (
                        <motion.ul
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          className={dynamicStyles.sublinkContainer}
                        >
                          {link.subLinks && link.subLinks.map((sublink, subIndex) => (
                            <motion.li
                              key={subIndex}
                              initial={{ opacity: 0, y: -10 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, y: -10 }}
                              className={dynamicStyles.nestedLink}
                              onClick={() => handleSublinkClick(subIndex)}
                            >
                              <div className='flex items-center justify-between w-full'>
                                <div>
                                  {sublink.title}
                                </div>
                                {sublink.sublink && <MdOutlineKeyboardArrowRight />}
                              </div>

                              <AnimatePresence>
                                {activeSublink === subIndex && sublink.sublink && (
                                  <ul className={dynamicStyles.sublinkContainer}>
                                    {sublink.sublink.map((nestedSublink, nestedIndex) => (
                                      <motion.li
                                        key={nestedIndex}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className={dynamicStyles.sublinkItem}
                                        onClick={() => {
                                          toggle()
                                          router.push(nestedSublink.url)
                                        }}
                                      >
                                        {nestedSublink.title}
                                      </motion.li>
                                    ))}
                                  </ul>
                                )}
                              </AnimatePresence>
                            </motion.li>
                          ))}
                          {link.images && (
                            <div className={dynamicStyles.submenuImagesContainer}>
                              {link.images.map((img, i) => (
                                <img src={img.img} alt={img.alt} className={dynamicStyles.submenuImage} key={i} />
                              ))}
                            </div>
                          )}
                        </motion.ul>
                      )}
                    </AnimatePresence>
                  </li>
                ))}
                <li className={dynamicStyles.navListItem}><Link href='#'>Look Bag</Link></li>
                <li className="pt-3 border-b pb-10 cursor-pointer"><Link href='#'>Blogs</Link></li>
              </ul>
              <ul className='mt-8'>
                <li className={dynamicStyles.footerLink}>About</li>
                <li className={dynamicStyles.footerLink}>Help Center</li>
                <li className={dynamicStyles.footerLink}>Gift Card</li>
                <li className={dynamicStyles.footerLink}>Return Policy</li>
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Navbar;
