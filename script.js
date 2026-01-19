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
function loadAccount(){
    ZOHO.CRM.API.getRecord({
        Entity: "Accounts",
        RecordID: recordId
    }).then(function(r){
        let d = r.data[0];
        lifeSave.innerHTML = "$" + (d.Lifetime_Savings || 0);
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
    });
}



function loadTrips() {
    ZOHO.CRM.API.getRelatedRecords({
        Entity: "Accounts",
        RecordID: recordId,
        RelatedList: "Trips1" // UPDATE THIS with the name found in Step 1
    }).then(function(r) {
        allTrips.innerHTML = "";

        if (r.data && r.data.length > 0) {
            r.data.forEach(t => {
                allTrips.innerHTML += `
                <div>
                    <b>${t.Name || "No Destination"}</b><br>
                    ${t.Start_Date || ""} - ${t.End_Date || ""}<br>
                    <b>Cost:</b> ${t.Trip_Cost || "0"}<br>
                    <b>Savings:</b> ${t.Estimated_Savings || "0"}<br>
                </div><hr>`;
            });
        } else {
            // This runs if the API call is successful but there are no records
            allTrips.innerHTML = "<p>No trips found for this account.</p>";
        }
    }).catch(function(error) {
        // If it's still a 400 error, this will print the detailed error reason
        console.error("Trips API Error:", error);
        allTrips.innerHTML = `<p style="color:red">Error: ${error.message || 'Check console for details'}</p>`;
    });
}


function saveTrip(){

let d={
    Name: document.getElementById("dest").value,
    Start_Date: document.getElementById("sdate").value,
    End_Date: document.getElementById("edate").value,
    Trip_Cost: document.getElementById("budget").value,

    // 🔴 IMPORTANT - LINK TO ACCOUNT
    Account_Name: {
        id: recordId
    }
};

ZOHO.CRM.API.insertRecord({
    Entity:"Trips",
    APIData:d
}).then(function(res){

    alert("Trip Added & Linked Successfully ✔");

    closePop();
    loadTrips(); // refresh related list

    // Clear form
    dest.value="";
    sdate.value="";
    edate.value="";
    budget.value="";

}).catch(function(err){
    console.error(err);
    alert("Error adding trip. Check console.");
});
}



async function loadDreams() {
    let response = await ZOHO.CRM.API.getRecord({
        Entity: "Accounts",
        RecordID: recordId
    });

    let record = response.data[0];
    let dreamsSubform = record.Dream_Destination; 

    dreamList.innerHTML = "";

    if (!dreamsSubform || dreamsSubform.length === 0) {
        dreamList.innerHTML = "<p>No dream destinations added</p>";
        return;
    }

    // 3. Loop through each row in the subform
    dreamsSubform.forEach(row => {
        dreamList.innerHTML += `
        <div style="background:#f3f6fb; padding:15px; border-radius:12px; margin-bottom:12px; box-shadow:0 5px 10px rgba(0,0,0,.1)">
            <b>Destination :</b> ${row.Dream_Destination_Name || "-"} <br>
            <b>Target Month :</b> ${row.Target_Month || "-"} <br>
            <b>Target Year :</b> ${row.Target_Year || "-"} <br>
            <b>Priority :</b> ${row.Priority || "-"} <br>
            <b>Estimated Cost :</b> ₹${row.Estimated_Cost || "0"}
        </div>
        `;
    });
}

async function loadCurrentTrip(){

    try{
        let res = await ZOHO.CRM.API.getRelatedRecords({
            Entity: "Accounts",
            RecordID: recordId,
            RelatedList: "Trips1"   // 🔴 YOUR RELATED LIST API NAME
        });

        if(!res.data || res.data.length==0){
            tripInfo.innerHTML="<p>No trips found</p>";
            return;
        }

        let today = new Date();

        // Filter upcoming trips
        let upcoming = res.data.filter(t=>{
            return t.Start_Date && new Date(t.Start_Date) >= today;
        });

        if(upcoming.length==0){
            tripInfo.innerHTML="<p>No upcoming trips</p>";
            return;
        }

        // Sort by nearest date
        upcoming.sort((a,b)=>{
            return new Date(a.Start_Date) - new Date(b.Start_Date);
        });

        let trip = upcoming[0]; // nearest trip

        tripInfo.innerHTML=`
        <div style="background:#f3f6fb;padding:15px;border-radius:12px">
            <b>Destination:</b> ${trip.Name || "-"} <br>
            <b>Start Date:</b> ${trip.Start_Date || "-"} <br>
            <b>End Date:</b> ${trip.End_Date || "-"} <br>
            <b>Budget:</b> ₹${trip.Trip_Cost || "0"} <br>
            <b>Savings:</b> ₹${trip.Estimated_Savings || "0"}
        </div>
        `;

    }catch(e){
        console.error(e);
        tripInfo.innerHTML="<p style='color:red'>Error loading trip</p>";
    }
}


function openPopup(id){
document.getElementById(id).style.display="flex";

if(id=="dreams"){
loadDreams();
}
if(id=="viewTrips"){
loadTrips();
}
if(id=="currentTrip"){
    loadCurrentTrip();
}
}
/* MEMBER EDIT */

function enableMemberEdit(){
    toggleMemberFields(false);

    editMemberBtn.style.display="none";
    saveMemberBtn.style.display="inline-block";
}

function saveMember(){

    let data={
        id: recordId,   // 🔴 VERY IMPORTANT
        Full_Name:fullName.value,
        DOB:dob.value,
        Contact_Number:phone.value,
        Email:email.value,
        Address:address.value
    };

    ZOHO.CRM.API.updateRecord({
        Entity:"Accounts",
        APIData:data
    }).then(()=>{
        alert("Member info updated ✔");

        toggleMemberFields(true);

        editMemberBtn.style.display="inline-block";
        saveMemberBtn.style.display="none";
    }).catch(err=>{
        console.error(err);
        alert("Update failed. Check console.");
    });
}


function toggleMemberFields(disabled){
    fullName.disabled=disabled;
    dob.disabled=disabled;
    phone.disabled=disabled;
    email.disabled=disabled;
    address.disabled=disabled;
}


/* DOCS EDIT */

function enableDocsEdit(){
    toggleDocsFields(false);

    editDocsBtn.style.display="none";
    saveDocsBtn.style.display="inline-block";
}

function saveDocs(){

    let data={
        id: recordId,   // 🔴 VERY IMPORTANT
        Passport_Number:passport.value,
        Passport_Expiry_Date:expiry.value,
        Passport_Issued_Country:country.value
    };

    ZOHO.CRM.API.updateRecord({
        Entity:"Accounts",
        APIData:data
    }).then(()=>{
        alert("Documents updated ✔");

        toggleDocsFields(true);

        editDocsBtn.style.display="inline-block";
        saveDocsBtn.style.display="none";
    }).catch(err=>{
        console.error(err);
        alert("Update failed. Check console.");
    });
}


function toggleDocsFields(disabled){
    passport.disabled=disabled;
    expiry.disabled=disabled;
    country.disabled=disabled;
}



