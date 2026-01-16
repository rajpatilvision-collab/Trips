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
ytd.innerHTML="$"+d.Year_to_Date_Savings;
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

/* UPDATE MEMBER INFO */
async function updateMember(){

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

alert("Updated Successfully");
}

/* UPDATE DOCS */
async function updateDocs(){

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

alert("Documents Updated");
}


async function loadTrips(){

let r = await ZOHO.CRM.API.getRelatedRecords({
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
