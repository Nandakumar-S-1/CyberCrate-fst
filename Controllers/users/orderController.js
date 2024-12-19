const Order = require("../../Models/orderModel");
const User = require("../../Models/userModel");
const Cart = require("../../Models/cartModel");
const Address = require("../../Models/addressModel");

const placeOrders = async (req, res) => {
  try {
    const userId = req.session.user;
    const { orderedItems, totalPrice, finalAmount, discount, address } =
      req.body;

    const newOrder = new Order({
      user: userId,
      orderedItems,
      totalPrice,
      finalAmount,
      discount,
      address,
      status: "Pending",
    });
    await newOrder.save();

    res
      .status(200)
      .send({ message: "Order placed successfully", order: newOrder });
  } catch (error) {
    console.error("Error placing order:", error);
    res.status(500).send({ message: "Error placing order" });
  }
};

const getUserOrders = async (req, res) => {
  try {
    const userId = req.session.user;
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).send({ message: "User not found" });
    }

    const orders = await Order.find({ user: userId })
      .populate("orderedItems.product")
      .sort({ createdAt: -1 });

    res.render("users/order", { user, orders });
  } catch (error) {
    console.error("Error getting user orders:", error);
    res.status(500).send({ message: "Error getting user orders" });
  }
};


// const getCheckoutPage = async (req, res) => {
//   try {
//       const userId = req.session.user;
//       console.log("the current user is", userId);

//       if (!userId) {
//           return res.status(400).send({ message: 'User is not logged in' });
//       }

//       // Retrieve cart for the user
//       const cart = await Cart.findOne({ userId }).populate('items.productId');
//       console.log("the cart is", cart);

      

//       // Retrieve addresses for the user
//       const addressData = await Address.findOne({ userId });
//       const addresses = addressData ? addressData.address : [];
      
//       const user = await User.findById(userId); 
//       const defaultAddress = addresses.find(addr => addr._id.toString() === user.defaultAddressId);

//       // Check if the cart exists
//       if (!cart) {
//           return res.render('users/checkout', {
//               user: await User.findById(userId),
//               addresses,
//               defaultAddress: defaultAddress || null,
//               cart: { items: [], totalAmount: 0, discount: 0, finalAmount: 0 }
//           });
//       }

//       // Filter out blocked products
//       const availableItems = cart.items.filter(item => !item.productId.isBlocked);
//       cart.items = availableItems;

//       // Calculate totals
//       const totalAmount = cart.items.reduce((total, item) => total + item.totalPrice, 0);
//       const discount = 0; // Modify as needed
//       const finalAmount = totalAmount - discount;

//       if (cart.items.length === 0) {
//           return res.render('users/checkout', {
//               user,
//               addresses,
//               defaultAddress: defaultAddress || null,
//               cart: { items: [], totalAmount: 0, discount: 0, finalAmount: 0 }
//           });
//       }

//       res.render('users/checkout', {
//           user,
//           addresses,
//           defaultAddress: defaultAddress || null,
//           cart: { items: cart.items, totalAmount, discount, finalAmount }
//       });
//   } catch (error) {
//       console.error('Error loading checkout page:', error);
//       res.status(500).send({ message: 'Error loading checkout page' });
//   }
// };


const getCheckoutPage = async (req, res) => {
  try {
      const userId = req.session.user;
      console.log("the current user is", userId);

      if (!userId) {
          return res.status(400).send({ message: "User is not logged in" });
      }

      // Retrieve cart for the user
      const cart = await Cart.findOne({ userId }).populate("items.productId");
      console.log("the cart is", cart);

      // Retrieve addresses for the user
      const addressData = await Address.findOne({ userId });
      const addresses = addressData ? addressData.address : [];

      // Retrieve the user and default address
      const user = await User.findById(userId).populate('addresses');
      let defaultAddress = addresses.find((addr) => {
        addr._id.toString() === user.defaultAddressId
  });

      // If no default address, use the first address in the list
      if (!defaultAddress && addresses.length > 0) {
          defaultAddress = addresses[0];
      }

      // Check if the cart exists
      if (!cart) {
          return res.render("users/checkout", {
              user,
              addresses,
              defaultAddress: defaultAddress || null,
              cart: { items: [], totalAmount: 0, discount: 0, finalAmount: 0 },
          });
      }

      // Filter out blocked products
      const availableItems = cart.items.filter(
          (item) => !item.productId.isBlocked
      );
      cart.items = availableItems;

      // Calculate totals
      const totalAmount = cart.items.reduce(
          (total, item) => total + item.totalPrice,
          0
      );
      const discount = 0;
      const finalAmount = totalAmount - discount;

      if (cart.items.length === 0) {
          return res.render("users/checkout", {
              user,
              addresses,
              defaultAddress: defaultAddress || null,
              cart: { items: [], totalAmount: 0, discount: 0, finalAmount: 0 },
          });
      }

      res.render("users/checkout", {
          user,
          addresses,
          defaultAddress: defaultAddress || null,
          cart: { items: cart.items, totalAmount, discount, finalAmount },
      });
  } catch (error) {
      console.error("Error loading checkout page:", error);
      res.status(500).send({ message: "Error loading checkout page" });
  }
};


// const getCheckoutPage = async (req, res) => {
//   try {
//     const userId = req.session.user;
//     console.log("the current user is", userId);

//     if (!userId) {
//       return res.status(400).send({ message: "User is not logged in" });
//     }

//     // Retrieve cart for the user
//     const cart = await Cart.findOne({ userId }).populate("items.productId");
//     console.log("the cart is", cart);

//     // Retrieve addresses for the user
//     const addressData = await Address.findOne({ userId });
//     const addresses = addressData ? addressData.address : [];

//     // Retrieve the user and default address
//     const user = await User.findById(userId);
//     let defaultAddress = addresses.find(
//       (addr) => addr._id.toString() === user.defaultAddressId
//     );

//     // If no default address, use the first address in the list
//     if (!defaultAddress && addresses.length > 0) {
//       defaultAddress = addresses[0];
//     }

//     // Check if the cart exists
//     if (!cart) {
//       return res.render("users/checkout", {
//         user,
//         addresses,
//         defaultAddress: defaultAddress || null,
//         cart: { items: [], totalAmount: 0, discount: 0, finalAmount: 0 },
//       });
//     }

//     // Filter out blocked products
//     const availableItems = cart.items.filter(
//       (item) => !item.productId.isBlocked
//     );
//     cart.items = availableItems;

//     // Calculate totals
//     const totalAmount = cart.items.reduce(
//       (total, item) => total + item.totalPrice,
//       0
//     );
//     const discount = 0; // Modify as needed
//     const finalAmount = totalAmount - discount;

//     if (cart.items.length === 0) {
//       return res.render("users/checkout", {
//         user,
//         addresses,
//         defaultAddress: defaultAddress || null,
//         cart: { items: [], totalAmount: 0, discount: 0, finalAmount: 0 },
//       });
//     }

//     res.render("users/checkout", {
//       user,
//       addresses,
//       defaultAddress: defaultAddress || null,
//       cart: { items: cart.items, totalAmount, discount, finalAmount },
//     });
//   } catch (error) {
//     console.error("Error loading checkout page:", error);
//     res.status(500).send({ message: "Error loading checkout page" });
//   }
// };





module.exports = {
  getUserOrders,
  placeOrders,
  getCheckoutPage,
};
