import React, { useState, useEffect, useContext, Component } from 'react';
import { Link, useNavigate } from 'react-router-dom'
import { Helmet } from "react-helmet";
import axios from 'axios';
import { useDispatch } from 'react-redux';
import { authActions } from '../../redux/store';
import { toast } from 'react-hot-toast';
import Header from '../components/Header';
import Footer from '../components/Footer';
import axiosInstance from '../../axiosInstance';
import getCookie from '../components/extra/getCookie';

const Comparsion = () => {


  const [IsComparsion, setIsComparsion] = useState(true);

  const [ratings, setRatings] = useState([]);

  const [comparison, setComparsion] = useState([]);

  const [currentStep, setCurrentStep] = useState(1);

  const handleNext = () => {
    setCurrentStep(currentStep + 1);
  };

  const handlePrevious = () => {
    setCurrentStep(currentStep - 1);
  };


  const navigate = useNavigate();
  const dispatch = useDispatch();

  const isLoginFromLocalStorage = getCookie('token') ? true : false;

  const [isLogin, setIsLogin] = useState(isLoginFromLocalStorage);

  const [isLoginForm, setIsLoginForm] = useState(true); // State to manage which form to display

  const toggleForm = () => {
    setIsLoginForm(prevState => !prevState); // Toggle between login and signup forms
  };


  const [showModal, setShowModal] = useState(false);

  const handleClose = () => setShowModal(false);
  const handleShow = () => setShowModal(true);

  useEffect(() => {
    const checkUserToken = async () => {
      console.log('Effect is running');
      // Check if this is printed multiple times
      const usertoken = getCookie('token');
      if (usertoken) {
        console.log('Token found in local storage'); // Check if this is printed multiple times

        // toast.success("Welcome back");
      }
    }
    checkUserToken();
  }, [dispatch, navigate]);



  const [inputs, setInputs] = useState({
    username: '',
    email: '',
    password: '',
  });


  const [Logininputs, setLoginInputs] = useState({
    email: '',
    password: '',
  });


  const Logincredentials = {
    email: Logininputs.email,
    password: Logininputs.password
  };

  //handle input change
  const handleLoginChange = (e) => {
    setLoginInputs((prevState) => ({
      ...prevState,
      [e.target.name]: e.target.value,
    }));

  };

  //form handle
  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    try {
      const { data } = await axiosInstance.post('/login', Logincredentials);
      const { success, token, user, message } = data;

      if (success) {
        // Save token and user ID to localStorage
        localStorage.setItem('token', user.token);
        localStorage.setItem('userId', user._id);

        toast.success("login sucesssfully");
        console.log('user', user)

        if (user) {
          const { _id, username, email } = user;
          const userToStore = { _id, username, email };
          localStorage.setItem('user', JSON.stringify(userToStore));
        }

        // Dispatch login action if you're using Redux
        dispatch(authActions.login());
        setIsLogin(true); // Set isLogin to true when token is found

        // Redirect user or perform other actions upon successful login
      }
      console.log("Message from backend:", message);

    } catch (error) {
      console.error('Error during login:', error);
      // Handle network errors, API issues, etc.
      toast.error(error.response.data.message);

    }
  };

  const userString =  getCookie('user');
  let initialUserData = {
    phone: '',
    pincode: '',
    country: '',
    address: ''
  };

  if (userString) {
    const { phone, pincode, country, address } = JSON.parse(userString);
    // Use user information from localStorage as initial data
    initialUserData = { phone, pincode, country, address };
  }



  // Set initial state using retrieved user information
  const [Orderinputs, setOrderInputs] = useState(initialUserData);

  const [Ordercart, setOrderCart] = useState({});

  const Ordercredentials = {
    phone: Orderinputs.phone,
    pincode: Orderinputs.pincode,
    country: Orderinputs.country,
    address: Orderinputs.address,
    items: Ordercart,
    status: '1',
    mode: 'cod',
    details: {
      phone: Orderinputs.phone,
      pincode: Orderinputs.pincode,
      country: Orderinputs.country,
      address: Orderinputs.address,
    },
    totalAmount: '',
  };




  const getRating = async () => {
    try {
      const { data } = await axiosInstance.get(`/all-rating`);
      setRatings(data.ratings);
      console.log('getRating', data)

    } catch (error) {
      console.error("Error fetching rating:", error);
    }
  };



  const getComparsion = async () => {
  //  const id = localStorage.getItem('userId');
    const id = getCookie('userId');


    try {
      const { data } = await axiosInstance.get(`/view-compare/${id}`);
      console.log("comparsion", data);
      setComparsion(data.comparsion.reverse());

      setIsComparsion(false)
    } catch (error) {
      console.error("Error fetching rating:", error);
    }
  };


  const handleDelete = async (id) => {

    try {
      await axiosInstance.delete(`/delete-compare/${id}`);
      toast.success("Deleted Comparsion Sucessfully");
      setIsComparsion(true);
      getComparsion();
    } catch (error) {
      console.error('Error deleting wishlist item:', error);
    }
  };


  useEffect(() => {
    getRating();
    getComparsion();
    const userCart = localStorage.getItem('react-use-cart');
    if (userCart) {
      const { items } = JSON.parse(userCart);
      setOrderCart(items);
    }
  }, []); // Empty dependency array to run this effect only once when the component mounts




  //handle input change
  const handleOrderChange = (e) => {
    setOrderInputs((prevState) => ({
      ...prevState,
      [e.target.name]: e.target.value,
    }));

  };



  //form handle
  const handleOrderSubmit = async (e) => {
    const userId = localStorage.getItem('userId');
    e.preventDefault();

    function generateRandomString(length) {
      const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
      let result = '';
      const charactersLength = characters.length;

      for (let i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
      }

      return result;
    }
    const randomKey = generateRandomString(50);


    const updatedFormData = {
      ...Ordercredentials,

      token: randomKey,
    };


    try {
      const response = await axiosInstance.post(`/create-order/${userId}`, updatedFormData);

      if (response && response.data) {
        const { success, token, user, message } = response.data;

        if (success) {
          // Save token and user ID to localStorage
          localStorage.setItem('token', user.token);
          localStorage.setItem('userId', user._id);

          if (user) {
            const { _id, username, email, phone, pincode, country, address } = user;
            const userToStore = { _id, username, email, phone, pincode, country, address };
            localStorage.setItem('user', JSON.stringify(userToStore));
          }

          toast.success("order sucesssfully");


        }
        console.log("Message from backend:", message);
      }

    } catch (error) {
      console.error('Error during login:', error);
      // Handle network errors, API issues, etc.
      toast.error(error.response.data.message);

    }
  };




  const credentials = {
    username: inputs.username,
    email: inputs.email,
    password: inputs.password
  };
  const [loginError, setLoginError] = useState(false);
  const [isLoading, setIsLoading] = useState(true); // Add loading state


  //handle input change
  const handleSignupChange = (e) => {
    setInputs((prevState) => ({
      ...prevState,
      [e.target.name]: e.target.value,
    }));

  };

  //form handle
  const handleSignupSubmit = async (e) => {
    e.preventDefault();
    try {
      const { data } = await axiosInstance.post('/signup', credentials);
      const { success, token, user, message } = data;

      if (success) {
        // Save token and user ID to localStorage
        localStorage.setItem('token', user.token);
        localStorage.setItem('userId', user._id);

        toast.success("login sucesssfully");

        // Dispatch login action if you're using Redux
        dispatch(authActions.login());
        setIsLogin(true); // Set isLogin to true when token is found

        // Redirect user or perform other actions upon successful login
      }
      console.log("Message from backend:", message);

    } catch (error) {
      console.error('Error during login:', error);
      // Handle network errors, API issues, etc.
      toast.error(error.response.data.message);

    }
  };

  useEffect(() => {
    setIsLogin(isLoginFromLocalStorage);
  }, [isLoginFromLocalStorage, dispatch]);



  return (
    <>
      <Header />

      <Helmet>
        <title> My Comparsion | {window.location.hostname}</title>
      </Helmet>

      <>
        <div
          className="py-4 mb-4 mb-lg-10"
          style={{ backgroundColor: "var(--bs-secondary-bg)" }}
        >
          <div className="container d-lg-flex justify-content-between align-items-center py-2 py-lg-4">
            <div className="pe-lg-4 text-center text-lg-start">
              <h1 className="h3 mb-0">Compare products</h1>
            </div>
            <div className="pt-2 pt-lg-0">
              <nav aria-label="breadcrumb">
                <ol className="breadcrumb flex-lg-nowrap justify-content-center justify-content-lg-start">
                  <li className="breadcrumb-item">
                    <Link
                      className="text-nowrap"
                      to="/"
                      previewlistener="true"
                    >
                      <i className="ri-store-2-line" /> Home{" "}
                    </Link>
                  </li>

                  <li
                    className="breadcrumb-item text-nowrap active"
                    aria-current="page"
                  >
                    Comparsion
                  </li>
                </ol>
              </nav>
            </div>
          </div>
        </div>

        <div className="container overflow-sm-auto"   >


          {IsComparsion
            ? (<>
              <div className="row mb-4">

                {
                  Array.from({ length: 4 }).map((_, index) => (
                    <div
                      key={index}
                      className="col-md-3 col-sm-6 mt-4"
                    >
                      <div
                        className="card-1 skeleton"
                        style={{ height: 430, borderRadius: 5 }}
                      ></div>
                    </div>
                  ))}
              </div>

            </>)
            : (<>

            
              <table className="table table-bordered table-hover table-layout-fixed fs-sm" style={{ minWidth: "58rem" }}>
                <thead>
                  <tr>
                    <td className="align-middle text-center">
                      <Link className="btn-add" type="button" to="/"><i className="ri-add-line"></i></Link>
                      <span className="d-block text-body-secondary mt-4 fs-sm">Add to comparison</span>
                    </td>
                    {comparison.map((item, index) => {
                      return (
                        <React.Fragment key={index}  >

                        {item.productDetail !== undefined && (
                          <td className="text-center">
                          <Link className="d-inline-block mb-2" to={`/product/${item.productDetail?._id}`}><img src={item.productDetail?.pImage} width="100" alt={item.productDetail?.title} /></Link>
                          <h3 className="product-title fs-sm mb-2"><Link to={`/product/${item.productDetail?._id}`}>{item.productDetail?.title}</Link></h3>
                          <button type="button" className="btn btn-sm d-flex align-items-center justify-content-center text-danger m-auto" onClick={() => handleDelete(item._id)}  ><i className="ri-delete-bin-line me-1"></i> Remove</button>
                        </td>

                        )}
                        </React.Fragment>
                       
                      )

                    })}
                  </tr>

                  <tr>
                    <th>Price</th>

                    {comparison !== undefined && comparison.map((item, index) => {

                      return (
                        <React.Fragment key={index}  >

                        {item.productDetail !== undefined && (

                        <td  className="text-center">

                          <div className="product-price">
                            <span className="text-danger fs-5">
                              ₹{item.productDetail?.salePrice || '0'}
                              <del className="text-body-secondary ms-1">
                                <small>₹{item.productDetail?.regularPrice || '0'} </small>
                              </del>
                            </span>
                          </div>


                        </td>
                        )}
                        </React.Fragment>

                      )

                    })}
                  </tr>

                  <tr>
                    <th>Rating</th>
                    { comparison.map((item, index) => {
                      // Calculate average rating for the current product
                      const productRatings = ratings.filter(rating => rating.productId === item.productDetail?._id);
                      const totalRatings = productRatings.length;
                      const totalRatingValue = productRatings.reduce((acc, curr) => acc + curr.rating, 0);
                      const averageRating = totalRatings > 0 ? totalRatingValue / totalRatings : 0;

                      return (
                        <React.Fragment key={index}  >

                        {item.productDetail !== undefined && (
                        <td  className="text-center">
                          <span className={`star-rating star-${Math.round(averageRating) * 2}`} />
                        </td>
                        )}
                        </React.Fragment>
                      )


                    })}
                  </tr>
                </thead>
                <tbody>


                  {comparison.reduce((acc, item) => {
                    item.productDetail?.specifications.specifications.forEach(spec => {
                      const headingRow = {
                        label: spec.heading,
                        isHeadingRow: true
                      };
                      const existingHeading = acc.find(existing => existing.label === spec.heading);
                      if (!existingHeading) {
                        acc.push(headingRow);
                      }
                      if (existingHeading || spec.labels.every(label => comparison.some(product => product.productDetail.specifications.specifications.some(s => s.heading === spec.heading && s.labels.some(l => l.label === label.label && l.value === label.value))))) {
                        spec.labels.forEach(label => {
                          const existingSpec = acc.find(existing => existing.label === label.label && !existing.isHeadingRow);
                          if (existingSpec) {
                            existingSpec[item.productDetail.title] = label.value;
                          } else {
                            const newSpec = {
                              label: label.label,
                              [item.productDetail.title]: label.value
                            };
                            acc.push(newSpec);
                          }
                        });
                      }
                    });
                    return acc;
                  }, []).map((spec, index) => (
                    spec.isHeadingRow && comparison.every(item => item.productDetail?.specifications.specifications.some(s => s.heading === spec.label)) ? (
                      <tr key={index}>
                        <th style={{ background: "#00406e", color: "white" }} >{spec.label}</th>

                        {comparison.map((item, i) => (
                          <th key={i} style={{ background: "#00406e", color: "white" }} > <b> {item.productDetail.title} </b> </th>
                        ))}
                      </tr>

                    ) : (
                      comparison.every(item => spec[item.productDetail.title]) && (
                        <tr key={index}>
                          <td>{spec.label}</td>
                          {comparison.map((item, i) => (
                            <td key={i}>{spec[item.productDetail.title]}</td>
                          ))}
                        </tr>
                      )
                    )
                  ))}



                </tbody>
              </table>


            </>)}

        </div>

      </>






      <Footer />
    </>
  )
}

export default Comparsion
