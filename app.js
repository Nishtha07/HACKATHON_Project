const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose=require("mongoose");
const md5=require("md5");
const app=express();
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));
app.set('view engine', 'ejs');
mongoose.connect("mongodb://localhost:27017/companydb",{useNewUrlParser: true});
var flag=0;
var useridvar;
const companySchema={
	cin_number: Number,
	password: String,
  company: String,
  jobtitle: String,
  WorkExp: String,
  location: String,
  post: String,
  salary: String,
  description: String
};
const userSchema={
  email: String,
  password: String
};
const trackSchema={
  user_id: String,
  company_id: String,
  name: String,
  contact: Number,
  dob: Date,
  IntermediateSname: String,
  IntermediatePerc: String,
  HighSname: String,
  HighPerc: String,
  workExp :String,
  awards: String
}
const CompanyJob=mongoose.model("CompanyJob",companySchema);
const User=mongoose.model("User",userSchema);
const Track=mongoose.model("Track",trackSchema);
app.get("/",function(req,res)
{if(flag===0)
res.render("home",{quote:null,message:null});
else
{res.render("home",{quote:null,message: "Jobs Posted successfully!"});
flag=0;
}
});



app.post("/hiring",function(req,res)
{res.render("hiring-page",{msg:null});});

app.post("/registration",function(req,res)
{res.render("company",{msg:null});});

app.post("/registrationform",function(req,res){
	const company_name = req.body.company;
	CompanyJob.find({cin_number: req.body.cin},function(err,temp){
		if(temp){
			res.render("hiring-page", {msg:"Already Registered With this CIN Number"})
		}
		else{
			const value = new CompanyJob({
		company: req.body.company,
	    cin_number: req.body.cin,
	    password: req.body.pass, 
        jobtitle: req.body.jobtitle,
        WorkExp: req.body.wexperience,
        location: req.body.location,
        post: req.body.post,
        salary: req.body.salary,
		description:req.body.description
	});
	value.save(function(err){
		res.render("home",{message:null,quote:"Posted Successfully!!"});
	});
		}
	});
	
});



app.post("/company",function(req,res)
{const jobpost=new CompanyJob(
  { company:req.body.company,
    jobtitle:req.body.jobtitle,
    workExp:req.body.wexperience,
    location:req.body.location,
    post:req.body.post,
    salary:req.body.salary,
   description:req.body.description
 }
);
jobpost.save(function()
{flag=1;
res.redirect("/");
});
});


app.get("/login",function(req,res)
{
CompanyJob.find({},function(err,list)
{if(err)
console.log(err);
else
{
if(list)
res.render("companylist",{jobs: list,userid: useridvar});
}
});});
app.post("/apply",function(req,res)
{
Track.findOne({user_id: req.body.userid, company_id: req.body.id},function(err,found)
{if(err)
console.log(err);
else {
  if(found!=null)
  {res.render("Already");}
  else res.render("job",{id: req.body.id,userid: req.body.userid});
}});
});
app.post("/postajob",function(req,res)
{ useridvar=req.body.userid;
const jobid=req.body.job;
const userid=req.body.userid;
const trac=new Track({
  user_id: userid,
  company_id: jobid,
  name: req.body.name,
  dob: req.body.dob,
  contact: req.body.contact,
  IntermediateSname: req.body.school,
  IntermediatePerc: req.body.perc,
  HighSname: req.body.hschool,
  HighPerc: req.body.hperc,
  workExp: req.body.we,
  awards: req.body.ah
});
trac.save(function(err)
{if(err)
console.log(err);
else
res.redirect("/login");
});
});
app.get("/register",function(req,res)
{res.render("register",{imp:null});});
app.post("/register",function(req,res)
{
User.find({email: req.body.email},function(err,userlist)
{if(err)
console.log(err);
else
{
if(userlist.length===0)
{const user=new User({
email: req.body.email,
password: md5(req.body.password)
});
user.save(function(err)
{if(err)
  console.log(err);
else
res.render("registersucces");
}
);
}
else {
  res.render("register",{imp: "Email already Registered!"});
}
}
});
});
app.post("/login",function(req,res)
{ const email=req.body.email;
const password=md5(req.body.password);
User.findOne({email: email},function(err,founduser)
{if(err)
console.log(err);
else{
  if(founduser)
  {if(founduser.password===password)
  {CompanyJob.find({},function(err,list)
  {if(err)
  console.log(err);
  else
  {
  if(list)
  res.render("companylist",{jobs: list,userid: founduser._id});
  }
  });}
  else {
    res.render("home",{quote: "Wrong Password",message:null});
  }

  }
  else res.render("home",{quote: "Invalid email and password",message:null});
}
})});
app.listen(3000,function()
{console.log("Server successfully ran!");});
