const { response } = require('express');
var express = require('express');

var router = express.Router();
var productHelpers= require('../helpers/product-helpers')
/* GET home page. */
const checkLogin= (req,res,next)=>{
  if(req.session.adminloginStatus){
    next()
  }
  else{
    res.redirect('/admin')
  }
}

router.get('/view-product', checkLogin,function (req, res, next) {

  productHelpers.productDisplay().then((products)=>{
    let adminLogin = req.session.admin
    res.render('admin/view-product', { title: 'E-Commerce', adminLogin,products, admin : true });
  });
});

router.get('/', (req, res) => {
  if(req.session.adminloginStatus){
    res.redirect('/admin/view-product')
  }
  else{
    let loginError = req.session.adminloginError
    res.render('admin/login',{ admin : true ,loginError});
    req.session.adminloginError=false
    
  }
});

router.get('/signup', (req, res) => {
  res.render('admin/signup');
});


router.post('/signup', (req, res) => {

  productHelpers.ofSignup(req.body).then((data) => {
    console.log(data)
    res.render('admin/login')
  })

});

router.post('/', (req, res) => {

  productHelpers.ofLogin(req.body).then((response) => {
    if (response) {
      req.session.adminloginStatus= true
      req.session.admin = response.admin
      res.redirect('/admin')
    }
    else{
      req.session.adminloginStatus= false 
      req.session.adminloginError= "*Invalid Username or Password"
      res.redirect('/admin')
    }
  })
});

router.get('/logout',(req,res)=>{
  req.session.adminloginStatus=false
  req.session.admin=null
  res.redirect('/admin') 
});

router.get('/add-product',checkLogin,(req,res)=>{

  res.render('admin/add-product',{admin : true})
}); 

router.post('/add-product',checkLogin,(req,res)=>{
  console.log(req.body)
  productHelpers.productHelp(req.body,(id)=>{
    let img= req.files.Image
    img.mv('./public/product-images/'+id+'.jpg')
      res.redirect('/admin/add-product');
   
  })
});

router.get('/delete/:id',checkLogin,(req,res)=>{
   let productId = req.params.id
   productHelpers.toDelete(productId).then((response)=>{
     res.redirect('/admin')
   })
});

router.get('/edit/:id',checkLogin,(req,res)=>{
  productHelpers.getoneProduct(req.params.id).then((product)=>{
    res.render('admin/edit-product',{product,admin : true})
  })
});

router.post('/edit/:id',(req,res)=>{
  productHelpers.editProduct(req.params.id,req.body).then(()=>{
    res.redirect('/admin')
    if(req.files.Image){
      let img= req.files.Image
      console.log(true);
    img.mv('./public/product-images/'+req.params.id+'.jpg')
    }
    
  })
})

module.exports = router;
