if(process.env.NODE_ENV != "production"){
    require("dotenv").config();
}



const express=require("express");
const app=express();
const mongoose=require("mongoose");
const Listing=require("./models/listing.js");
const path=require("path");
const methodOverride = require("method-override");
const ejsMate=require("ejs-mate");
const wrapAsync=require("./utils/wrapAsync.js")
const ExpressError=require("./utils/ExpressError");
const {listingSchema,reviewSchema}=require("./schema.js");
const Review=require("./models/review.js");

const session = require("express-session");
const flash=require("connect-flash");
const listingRouter=require("./routes/listing.js");
const reviewRouter=require("./routes/review.js");
const userRouter=require("./routes/user.js");
const passport=require("passport");
const LocalStrategy=require("passport-local");

const User=require("./models/user.js");
const chatbotRoutes = require('./routes/chatbot');


const sessionOptions={
    secret:"secretCode",
    resave:false,
    saveUninitialized:true,
    cookie:{
        expires:Date.now()+ 1000 * 60 * 60 * 24 * 7,
        maxAge:1000 * 60 * 60 * 24 * 7,
    }
}

// app.get("/",(req,res)=>{
//     res.send("hii,i an root");
// })
app.use(express.json()); // Needed to parse JSON POST bodies
app.set("view engine","ejs");
app.set("views",path.join(__dirname,"views"));
app.use(express.urlencoded({extended:true}));
app.use(methodOverride("_method"));
app.engine("ejs",ejsMate);//same as includes/partials
app.use(express.static(path.join(__dirname,"public")))
// const qnaRoutes = require('./routes/qna');
// const chatRoutes = require('./routes/chat');



async function main(){
    await mongoose.connect("mongodb://127.0.0.1:27017/wanderlust")
}
main().then(()=>{
    console.log("connection established successfully");
}).catch(err=>console.log(err));


app.use(session(sessionOptions));
app.use(flash());

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use((req,res,next)=>{
    res.locals.success=req.flash("success");
    res.locals.error=req.flash("error");
    res.locals.CurrUser=req.user;
    next();
})


// app.use('/qna', qnaRoutes);
// app.use('/chat', chatRoutes);

// app.get("/demouser",async(req,res)=>{
//     let fakeUser=new User({
//         email:"student@gmail.com",
//         username:"delta-student",
//     })
//     let regUser=await User.register(fakeUser,"helloworld");
//     res.send(regUser);
// })

app.use("/listings",listingRouter);
app.use("/listings/:id/reviews",reviewRouter);
app.use("/",userRouter);
app.use('/chatbot', chatbotRoutes);

app.listen(8080,()=>{
    console.log("server is listening at port 8080");
})

app.get("/",(req,res)=>{
    res.send("welcome to our website wanderlust");
})

app.all("*",(req,res,next)=>{
    next(new ExpressError(404,"Page not found"));
})

//error handler
app.use((err,req,res,next)=>{
    let {status=500,message="something went wrong"}=err;
    // res.status(status).send(message);
    res.render("error.ejs",{err})
});

// app.get("/testListing",async(req,res)=>{
//     let sampleListing=new Listing({
//         title:"MY new villa",
//         description:"Infront of Beach",
//         price:12000,
//         location:"Goa",
//         country:"India",
        
//     })
//     await sampleListing.save();
//     console.log("sample was saved");
//     res.send("successful testing");
// })