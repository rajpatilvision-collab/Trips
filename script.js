// MAIN TABS
function showTab(tab){
    document.getElementById("dashboard").classList.add("hide");
    document.getElementById("profile").classList.add("hide");

    document.getElementById(tab).classList.remove("hide");

    // ACTIVE SIDEBAR
    document.querySelectorAll(".sidebar button")
    .forEach(b => b.classList.remove("active"));

    event.target.classList.add("active");
}


// PROFILE SUB TABS
function showProfileTab(tab){

// Hide sections
    document.getElementById("member").classList.add("hide");
    document.getElementById("docs").classList.add("hide");

    // Remove active
    document.getElementById(tab).classList.remove("hide");

    // ACTIVE SIDEBAR
    document.querySelectorAll(".profileTabs button")
    .forEach(b => b.classList.remove("active"));

    event.target.classList.add("active");

}





function openPopup(id){
document.getElementById(id).style.display="flex";
}

function closePop(){
document.querySelectorAll('.popup').forEach(p=>p.style.display="none");
}
let recordId;

/* INIT */
ZOHO.embeddedApp.on("PageLoad",function(data){
recordId = data.EntityId[0];
loadAccount();
loadTrips();
});
ZOHO.embeddedApp.init();

/* LOAD ACCOUNT DATA */
async function loadAccount(){

let r = await ZOHO.CRM.API.getRecord({
Entity:"Accounts",
RecordID:recordId
});

let d = r.data[0];

/* Dashboard cards */
lifeSave.innerHTML="$"+d.Lifetime_Savings;
ytd.innerHTML="$"+d.Year_To_Date_Savings;
avg.innerHTML="$"+d.Average_Savings_Per_Trip;
bookings.innerHTML=d.Total_Bookings;

/* Profile */
fullName.value=d.Full_Name;
dob.value=d.DOB;
phone.value=d.Contact_Number;
email.value=d.Email;
address.value=d.Address;

passport.value=d.Passport_Number;
expiry.value=d.Passport_Expiry_Date;
country.value=d.Passport_Issued_Country;
}


async function loadTrips(){

let r = await ZOHO.RECRUIT.API.getRelatedRecords({
Entity:"Accounts",
RecordID:recordId,
RelatedList:"Trips"
});

allTrips.innerHTML="";

r.data.forEach(t=>{
allTrips.innerHTML+=`
<div>
<b>${t.Destination_Name}</b><br>
${t.Start_Date} - ${t.End_Date}
</div><hr>`;
});
}

async function saveTrip(){

let d={
Destination_Name:dest.value,
Start_Date:sdate.value,
End_Date:edate.value,
Trip_Account:recordId
};

await ZOHO.CRM.API.insertRecord({
Entity:"Trips",
APIData:d
});

alert("Trip Added");
loadTrips();
}

async function loadDreams(){

let r = await ZOHO.CRM.API.getRecord({
Entity:"Accounts",
RecordID:recordId
});

// Use exact subform API name
let dreams = r.data[0].Dream_Destination; 

dreamList.innerHTML="";

if(!dreams || dreams.length==0){
dreamList.innerHTML="<p>No dream destinations added</p>";
return;
}

dreams.forEach(d=>{

dreamList.innerHTML += `
<div style="
background:#f3f6fb;
padding:15px;
border-radius:12px;
margin-bottom:12px;
box-shadow:0 5px 10px rgba(0,0,0,.1)
">

<b>Destination :</b> ${d.Dream_Destination_Name || "-"} <br>

<b>Target Month :</b> ${d.Target_Month || "-"} <br>

<b>Target Year :</b> ${d.Target_Year || "-"} <br>

<b>Priority :</b> ${d.Priority || "-"} <br>

<b>Estimated Cost :</b> ₹${d.Estimated_Cost || "0"}

</div>
`;
});
}


function openPopup(id){
document.getElementById(id).style.display="flex";

if(id=="dreams"){
loadDreams();
}
if(id=="viewTrips"){
loadTrips();
}
}
async function autoSaveMember(){

let data={
Full_Name:fullName.value,
DOB:dob.value,
Contact_Number:phone.value,
Email:email.value,
Address:address.value
};

await ZOHO.CRM.API.updateRecord({
Entity:"Accounts",
APIData:data,
RecordID:recordId
});

console.log("Auto saved");
}

async function autoSaveDocs(){

let data={
Passport_Number:passport.value,
Passport_Expiry_Date:expiry.value,
Passport_Issued_Country:country.value
};

await ZOHO.CRM.API.updateRecord({
Entity:"Accounts",
APIData:data,
RecordID:recordId
});
}




