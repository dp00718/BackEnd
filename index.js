const express = require('express')
const path = require('path');
const fs = require('fs');
const app = express()
const cors = require('cors');
const bodyParser = require('body-parser')
const mongoose = require('mongoose');
const bcrypt = require('bcrypt')
const nodemailer = require('nodemailer');
const jwt = require('jsonwebtoken');
require('dotenv').config();

mongoose
.connect(
  "mongodb+srv://7016034249dp:w5iv3PgZNCRgeY8m@cluster0.aut5xu0.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0"
)
.then(() => console.log("mongodb connected"))

const ContactSchema = new mongoose.Schema({
    name: {
    type: String,
    require: true,
    },
    email: {
    type: String,
    require: true,
    },
    mobileNo: {
    type: String,
    require: true,
    },
    message: {
    type: String,
    require: true,
    },
    });
   
        const User = mongoose.model("Contact", ContactSchema);

const RegistrationSchema = new mongoose.Schema({
        firstname: {
        type: String,
        require: true,
        },
        lastname: {
        type: String,
        require: true,
        },
        emailaddress: {
        type: String,
        require: true,
        },
        password: {
        type: String,
        require: true,
        },

        cart: [
          {
      
            categoryid: {
              type: Number,
              required:true,
            },
            productid:
            {
              type: Number,
              required:true,
             
            },
            productimg:
            {
              type: String,
              
              
             
            },
            productname:
            {
              type: String,
             
             
            },
            productprice:
            {
              type:String,
           
             
            },
            size:
            {
              type: String,
              
            },
            quantity:
            {
              type: Number,
              default: 1
            }
      
      
          },
        ],

        wish: [
          {
      
            categoryid: {
              type: Number,
              required:true,
            },

            productid:
            {
              type: Number,
              required:true,
            },

            productimg:
            {
              type: String,
            },

            productname:
            {
              type: String,
            },

            productprice:
            {
              type:String,
            },

          },
        ],

        shippingInfo: {
          name: String,
          mobile: String,
          email: String,
          address: String,
          state: String,
          pincode: String,
          landmark: String,
          city: String,
         
        },

        order: [
      
          {
    
            orderDate:{ 
              type: String
    
             },
      
            categoryid: {
              type: Number,
              required:true,
            },
            productid:
            {
              type: Number,
              required:true,
             
            },
            productimg:
            {
              type: String,
              
              
             
            },
            productname:
            {
              type: String,
             
             
            },
            productprice:
            {
              type:String,
           
             
            },
            size:
            {
              type: String,
              
            },
            quantity:
            {
              type: Number,
              default: 1
            }
      
      
          },
        ],
        });
       
        const User1 = mongoose.model("Register", RegistrationSchema);

app.use(cors());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'Assets')));


  app.post('/contact',async(req,res) =>{
    const{name,email,mobileNo,message} =req.body

    // console.log(name+email+phone+message)
    // const exist=await User.findOne({email,message})
    // if (exist){
    //     return res.json({success:false,error:'Your Data Already Exist'})
    // }
 const data = await User.create({
    name,email,mobileNo,message
    }) 

    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS,
        },
      })

      const mailOptions = {
        from: process.env.EMAIL_USER,
        to: email,
        subject: 'Nice to contact with you',
        html: `<p> Hello ${name} </p>, 
        <p>If you have any concern please contact us on the following.<p/> ,
        <p> 7016034249dp@gmail.com</p>,
        <iframe src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3692.749109373755!2d73.1950140750677!3d22.249596079723116!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x395fc50223d7e753%3A0x887201579efd2b19!2sNirvan%20Clinic!5e0!3m2!1sen!2sin!4v1717164233138!5m2!1sen!2sin" width="600" height="450" style="border:0;" allowfullscreen="" loading="lazy" referrerpolicy="no-referrer-when-downgrade"></iframe>`
      }

      const info = await transporter.sendMail(mailOptions)
      console.log(info.messageId)

    console.log(data)
    res.json({success:true,message:'Thanks Your Data Has Been Submitted'})
})

  app.post('/registration',async(req,res) =>{ 
    const{firstname,lastname,emailaddress,password} =req.body

    const exist=await User1.findOne({emailaddress})
    if (exist){
        return res.json({success:false,error:'Email Id Is Already Registered'})
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const data = await User1.create({
    firstname,lastname,emailaddress,password: hashedPassword 
    }) 

    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS,
        },
      })

      const mailOptions = {
        from: process.env.EMAIL_USER,
        to: emailaddress,
        subject: 'Welcome to Era',
        html: `<p> Hello ${firstname} </p>, <p>Thanks For Registrating<p/>`
      }

      const info = await transporter.sendMail(mailOptions)
      console.log(info.messageId)

      console.log(data)
      res.json({success:true,message:'Thanks Your Registration Is Successfully Done'})

});

  app.post('/login',async(req,res) =>{
    const{Username,Password} =req.body

    // console.log(Username,Password) 

    const exist = await User1.findOne({ emailaddress:Username})
    if(!exist){
        return res.json({success:false,error:"crendentials is wrong"})
    }
  
    const passwordMatch = await bcrypt.compare(Password, exist.password);
    if (!passwordMatch) {
        return res.json({ success:false, error: 'Invalid  password' });
      }

      const token = jwt.sign({ Username }, 'secret-key', { expiresIn: '24h' });
  
      const accountInfo={
        firstname:exist.firstname,
        lastname:exist.lastname,
        emailaddress:exist.emailaddress
      }
      // console.log(exist.Username)

    res.json({success:true,message:'Thanks Login Successfully Done',data:token,accountInfo:accountInfo,cartInfo:exist.cart,shippingInfo:exist.shippingInfo})

});

  app.get('/api', (req, res) => {
    const filePath = path.join(__dirname, 'data.json');
    fs.readFile(filePath, 'utf8', (err, data) => {
        if (err) {
            console.error(err);
            return res.json({ success: false, error: 'Internal Server Error' });
        } 
        const jsonData = JSON.parse(data); 
        const updatedData = jsonData.map(item => {
            if (item.home_page_route_category_page_img) {
                item.home_page_route_category_page_img = 'http://' + req.get('host') + item.home_page_route_category_page_img;
            }
            item.product_container = item.product_container.map(product => {
                return {
                    ...product,
                    imgs1: 'http://' + req.get('host') + product.imgs1,
                };
            });
            item.product_container.product = item.product_container.product.map(product1 => {
              return {
                  ...product1,
                  imgs: 'http://' + req.get('host') + product1.imgs,
              };
          });
            return item;
        });  
        res.json({ success: true, data: updatedData });
    });
  });

  app.get('/api1', (req, res) => {
    const filePath = path.join(__dirname, 'data1.json');
    fs.readFile(filePath, 'utf8', (err, data1) => {
        if (err) {
            console.error(err);
            return res.json({ success: false, error: 'Internal Server Error' });
        } 
        const jsonData = JSON.parse(data1); 
         
        res.json({ success: true, data1: jsonData });
    });
  }); 
  
  app.get('/account-details', async (req, res) => {
    try {
      const token = req.headers.authorization?.split(' ')[1];
      if (!token) {
        return res.status(401).json({ error: 'Token not provided' });
      }
  
      jwt.verify(token, 'secret-key', async (err, decoded) => {
        if (err) {
          return res.status(401).json({ error: 'Invalid token' });
        }
  
        const user = await User1.findOne({ email: decoded.email });
        if (!user) {
          return res.status(404).json({ error: 'User not found' });
        }
  
        const accountInfo = {
          firstname: user.firstname,
          lastname: user.lastname,
          emailaddress: user.emailaddress
        
        };
  
        res.json({ accountInfo:accountInfo });
      });
    } catch (error) {
      console.error('Error fetching cart items:', error);
      res.status(500).json({ message: 'Internal Server Error' });
    }
  });
  
  app.post('/update-account-data', async (req, res) => {
      const { firstname,lastname,emailaddress,password} = req.body;

      console.log(firstname,lastname,emailaddress,password)
        
        try {
        const token = req.headers.authorization?.split(' ')[1];
        if (!token) {
        
        return res.status(401).json({success: false,error: 'Token not provided' });
        }
        
        jwt.verify(token, 'secret-key', async (err, decoded) => {
        if (err) {
        
        return res.status(401).json({success: false, error: 'Invalid token' });
        }
        
        const user = await User1.findOne({ email: decoded.email });
        if (!user) {
        return res.status(404).json({success: false, error: 'User not found' });
        }
        
        const hashedPassword = await bcrypt.hash(password, 10);
        user.firstname = firstname;
        user.lastname = lastname;
        user.emailaddress = emailaddress;
        user.password=hashedPassword
        await user.save();
        
        const accountInfo = {
        
        firstname: user.firstname,
        lastname: user.lastname,
        emailaddress: user.emailaddress,
        password: user.password
        
        };
         
        res.json({ success: true, message: 'Thanks Your Information has Been Updated' ,accountInfo:accountInfo});
        
        });
        } catch (error) {
        console.error('Error fetching user address:', error);
        res.status(500).json({ success: false, error: 'Internal Server Error' });
        }

  });


  app.post('/add-to-cart', async (req, res) => {
    const { categoryid, productid,productimg,productname,productprice,size } = req.body;

    console.log(productimg)
  
    try {
      const token = req.headers.authorization?.split(' ')[1];
      if (!token) {
        return res.status(401).json({ success: false, error: 'Token not provided' });
      }
  
      jwt.verify(token, 'secret-key', async (err, decoded) => {
        if (err) {
          return res.status(401).json({ success: false, error: 'Invalid token' });
        }
  
        const user = await User1.findOne({ email: decoded.email });
        if (!user) {
          return res.status(404).json({ success: false, error: 'User not found' });
        }
  
        const existingProduct = user.cart.find(
          item => item.categoryid === categoryid && item.productid === productid && item.size === size
        );
        if (existingProduct) {
          return res.json({ success: false, error: 'Product with the same size already in the cart' });
        }
  
        // Add the product to the user's cart
        user.cart.push({
          categoryid,
          productid,
          productimg,
          productname,
          productprice,
          size
        });
  
        const result = await user.save();
  
        console.log(result);
  
        res.json({ success: true, message: 'Thanks Product added to cart', cartInfo: user.cart });
      });
    } catch (error) {
      console.error('Error adding to cart:', error);
      res.status(500).json({ success: false, error: 'Internal Server Error' });
    }
  });

  app.post('/remove-from-cart', async (req, res) => {
    const { categoryid,productid,size } = req.body;
  
    try {
      const token = req.headers.authorization?.split(' ')[1];
      if (!token) {
        return res.status(401).json({ message: 'Token not provided' });
      }
  
      jwt.verify(token, 'secret-key', async (err, decoded) => {
        if (err) {
          return res.status(401).json({ message: 'Invalid token' });
        }
  
  
        const user = await User1.findOneAndUpdate(
          { email: decoded.email },
          { $pull: { cart: { categoryid,productid,size} } },
          { new: true }
        );
  
     
        if (!user) {
          return res.status(404).json({ message: 'User not found' });
        }
  
      
  
        res.json({ success: true, message: 'Thanks Product removed from cart', cartInfo: user.cart });
      });
    } catch (error) {
      console.error('Error removing from cart:', error);
      res.status(500).json({ success: false, error: 'Internal Server Error' });
    }
  });

  app.post('/increase-quantity', async (req, res) => {
    const { categoryid, productid,size } = req.body;
  
    try {
      const token = req.headers.authorization?.split(' ')[1];
      if (!token) {
        return res.status(401).json({ message: 'Token not provided' });
      }
  
      jwt.verify(token, 'secret-key', async (err, decoded) => {
        if (err) {
          return res.status(401).json({ message: 'Invalid token' });
        }
  
        // Find the user by email from the decoded token
        const user = await User1.findOne({ email: decoded.email });
        if (!user) {
          return res.status(404).json({ message: 'User not found' });
        }
  
        const productInCart = user.cart.find(item => item.categoryid === categoryid && item.productid === productid && item.size === size);
        if (productInCart) {
          
          if (productInCart.quantity < 10) {
            productInCart.quantity = productInCart.quantity + 1;
          } else {
            return res.json({success:false, error: 'Maximum quantity 10' });
          }
        } else {
          return res.json({success:false, error: 'Product not found in cart' });
        }
  
        
        await user.save();
  
  
        res.json({ success: true, message: ' Thanks Quantity increased', cartInfo: user.cart });
      });
    } catch (error) {
      console.error('Error increasing quantity:', error);
      res.status(500).json({ success: false, error: 'Internal Server Error' });
    }
  });

  app.post('/decrease-quantity', async (req, res) => {
    const { categoryid, productid,size } = req.body;
  
    try {
      const token = req.headers.authorization?.split(' ')[1];
      if (!token) {
        return res.status(401).json({ message: 'Token not provided' });
      }
  
      jwt.verify(token, 'secret-key', async (err, decoded) => {
        if (err) {
          return res.status(401).json({ message: 'Invalid token' });
        }
  
        // Find the user by email from the decoded token
        const user = await User1.findOne({ email: decoded.email });
        if (!user) {
          return res.status(404).json({ message: 'User not found' });
        }
  
        const productInCart = user.cart.find(item => item.categoryid === categoryid && item.productid === productid && item.size===size)
        if (productInCart) {
          
          if (productInCart.quantity > 1) {
            productInCart.quantity = productInCart.quantity - 1;
          } else {
            return res.json({success:false, error: '1 Minimum quantity required' });
          }
        } else {
          return res.json({success:false, error: 'Product not found in cart' });
        }
  
        
        await user.save();
  
  
        res.json({ success: true, message: 'Thanks Quantity decreased', cartInfo: user.cart });
      });
    } catch (error) {
      console.error('Error increasing quantity:', error);
      res.status(500).json({ success: false, error: 'Internal Server Error' });
    }
  });

  app.post('/add-to-wish', async (req, res) => {
    const { categoryid, productid,productimg,productname,productprice} = req.body;
  
    console.log(productimg)
  
    try {
      const token = req.headers.authorization?.split(' ')[1];
      if (!token) {
        return res.status(401).json({ success: false, error: 'Token not provided' });
      }
  
      jwt.verify(token, 'secret-key', async (err, decoded) => {
        if (err) {
          return res.status(401).json({ success: false, error: 'Invalid token' });
        }
  
        const user = await User1.findOne({ email: decoded.email });
        if (!user) {
          return res.status(404).json({ success: false, error: 'User not found' });
        }
  
        const existingProduct = user.wish.find(
          item => item.categoryid === categoryid && item.productid === productid 
        );
        if (existingProduct) {
          return res.json({ success: false, error: 'Product  already in the wish' });
        }
  
        // Add the product to the user's cart
        user.wish.push({
          categoryid,
          productid,
          productimg,
          productname,
          productprice,
          
        });
  
        const result = await user.save();
  
        console.log(result);
  
        res.json({ success: true, message: 'Thanks Product added to wish', wishInfo: user.wish });
      });
    } catch (error) {
      console.error('Error adding to wish', error);
      res.status(500).json({ success: false, error: 'Internal Server Error' });
    }
  });

  app.get('/wish', async (req, res) => {
    try {
      const token = req.headers.authorization?.split(' ')[1];
      if (!token) {
        return res.status(401).json({ message: 'Token not provided' });
      }
  
      jwt.verify(token, 'secret-key', async (err, decoded) => {
        if (err) {
          return res.status(401).json({ message: 'Invalid token' });
        }
  
        const user = await User1.findOne({ email: decoded.email });
        if (!user) {
          return res.status(404).json({ message: 'User not found' });
        }
  
        // Send the user's cart items
        res.json({ wishInfo: user.wish });
      });
    } catch (error) {
      console.error('Error fetching cart items:', error);
      res.status(500).json({ message: 'Internal Server Error' });
    }
  });

  app.post('/remove-from-wish', async (req, res) => {
    const { categoryid,productid } = req.body;
  
    try {
      const token = req.headers.authorization?.split(' ')[1];
      if (!token) {
        return res.status(401).json({ message: 'Token not provided' });
      }
  
      jwt.verify(token, 'secret-key', async (err, decoded) => {
        if (err) {
          return res.status(401).json({ message: 'Invalid token' });
        }
  
  
        const user = await User1.findOneAndUpdate(
          { email: decoded.email },
          { $pull: { wish: { categoryid,productid} } },
          { new: true }
        );
  
     
        if (!user) {
          return res.status(404).json({ message: 'User not found' });
        }
  
      
  
        res.json({ success: true, message: 'Thanks Product removed from wishlist', wishInfo: user.wish });
      });
    } catch (error) {
      console.error('Error removing from wish:', error);
      res.status(500).json({ success: false, error: 'Internal Server Error' });
    }
  });

  app.post('/save-shipping-info', async (req, res) => {
    const { name, email, mobile, address, state, pincode, landmark, city } = req.body;
  
    try {
      const token = req.headers.authorization?.split(' ')[1];
      if (!token) {
        return res.status(401).json({ success:false,error:'Token not provided' });
      }
  
      jwt.verify(token, 'secret-key', async (err, decoded) => {
        if (err) {
          return res.status(401).json({success:false,error: 'Invalid token' });
        }
  
        const user = await User1.findOne({ email: decoded.email });
        if (!user) {
          return res.status(404).json({success:false,error: 'User not found' });
        }
  
        // Prepare the shipping information
        const shippingInfo = {
          name,
          mobile,
          email,
          address,
          state,
          pincode,
          landmark,
          city
        };
  
        // Update user's shipping information
        user.shippingInfo = shippingInfo;
        await user.save();
  
        console.log(user);
  
        res.json({
          success: true,
          message: 'Thanks Shipping information saved successfully',
          shippingInfo: user.shippingInfo
        });
      });
    } catch (error) {
      console.error('Error saving shipping information:', error);
      res.status(500).json({ success: false, error: 'Internal Server Error' });
    }
  });

  app.get('/get-user-address', async (req, res) => {
    try {
      const token = req.headers.authorization?.split(' ')[1];
      if (!token) {
        return res.status(401).json({ message: 'Token not provided' });
      }
  
      jwt.verify(token, 'secret-key', async (err, decoded) => {
        if (err) {
          return res.status(401).json({ message: 'Invalid token' });
        }
  
        const user = await User1.findOne({ email: decoded.email });
        if (!user) {
          return res.status(404).json({ message: 'User not found' });
        }
  
        // Send the user's cart items
        res.json({ shippingInfo: user.shippingInfo });
      });
    } catch (error) {
      console.error('Error fetching cart items:', error);
      res.status(500).json({ message: 'Internal Server Error' });
    }
  });

  
  app.get('/cart', async (req, res) => {
    try {
      const token = req.headers.authorization?.split(' ')[1];
      if (!token) {
        return res.status(401).json({ success: false, message: 'Token not provided' });
      }
  
      jwt.verify(token, 'secret-key', async (err, decoded) => {
        if (err) {
          return res.status(401).json({ success: false, message: 'Invalid token' });
        }
  
        const user = await User1.findOne({ email: decoded.email });
        if (!user) {
          return res.status(404).json({ success: false, message: 'User not found' });
        }
  
        res.json({cartInfo: user.cart });
      });
    } catch (error) {
      console.error('Error fetching cart:', error);
      res.status(500).json({ success: false, error: 'Internal Server Error' });
    }
  });

  app.post('/add-to-order', async (req, res) => {

    const { orderDate } = req.body;
    try {
      const token = req.headers.authorization?.split(' ')[1];
      if (!token) {
        return res.status(401).json({ error: 'Token not provided' });
      }
  
      jwt.verify(token, 'secret-key', async (err, decoded) => {
        if (err) {
          return res.status(401).json({ error: 'Invalid token' });
        }
  
        const user = await User1.findOne({ email: decoded.email });
        if (!user) {
          return res.status(404).json({ error: 'User not found' });
        }
  
  
  
        // Add each cart item to the order with the current date
        user.cart.forEach(item => {
          user.order.push({
            orderDate,
            categoryid: item.categoryid,
            productid: item.productid,
            productimg:item.productimg,
            productname:item.productname,
            productprice:item.productprice,
            size: item.size,
            quantity: item.quantity,
  
          });
        });
  
        // Clear user cart after adding to order
        user.cart = [];
  
        await user.save();
  
        res.json({
          success: true,
          message: 'Thanks! Your Order has Been Confirmed',
          orderInfo: user.order,
          cartInfo: user.cart
        });
      });
    } catch (error) {
      console.error('Error adding to order:', error);
      res.status(500).json({ success: false, error: 'Internal Server Error' });
    }
  });
  
  
  // get order
  app.get('/order', async (req, res) => {
    try {
      const token = req.headers.authorization?.split(' ')[1];
      if (!token) {
        return res.status(401).json({ message: 'Token not provided' });
      }
  
      jwt.verify(token, 'secret-key', async (err, decoded) => {
        if (err) {
          return res.status(401).json({ message: 'Invalid token' });
        }
  
        const user = await User1.findOne({ email: decoded.email });
        if (!user) {
          return res.status(404).json({ message: 'User not found' });
        }
  
      
        res.json({ orderInfo: user.order });
      });
    } catch (error) {
      console.error('Error fetching order items:', error);
      res.status(500).json({ message: 'Internal Server Error' });
    }
  });

  app.post('/remove-from-order', async (req, res) => {
    const {categoryid, productid} = req.body;
  
    try {
      const token = req.headers.authorization?.split(' ')[1];
      if (!token) {
        return res.status(401).json({ message: 'Token not provided' });
      }
  
      jwt.verify(token, 'secret-key', async (err, decoded) => {
        if (err) {
          return res.status(401).json({ message: 'Invalid token' });
        }
  
  
        const user = await User1.findOneAndUpdate(
          { email: decoded.email },
          { $pull: { order: { productid, categoryid} } },
          { new: true }
        );
  
     
        if (!user) {
          return res.status(404).json({ message: 'User not found' });
        }
  
      
  
        res.json({ success: true, message: 'Thanks Product removed from orderlist', orderInfo: user.order });
      });
    } catch (error) {
      console.error('Error removing from order:', error);
      res.status(500).json({ success: false, error: 'Internal Server Error' });
    }
  });



app.listen(9000,()=>{
    console.log("connected")
})