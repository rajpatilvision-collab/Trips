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
        RelatedList: "Trip_List" // UPDATE THIS with the name found in Step 1
    }).then(function(r) {
        allTrips.innerHTML = "";

        if (r.data && r.data.length > 0) {
            r.data.forEach(t => {
                allTrips.innerHTML += `
                <div>
                    <b>${t.Destination_Name || "No Destination"}</b><br>
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
Destination_Name:dest.value,
Start_Date:sdate.value,
End_Date:edate.value,
Trip_Account:recordId
};

ZOHO.CRM.API.insertRecord({
Entity:"Trips",
APIData:d
});

alert("Trip Added");
loadTrips();
}

async function loadDreams() {
    // 1. Await the API call
    let response = await ZOHO.CRM.API.getRecord({
        Entity: "Accounts",
        RecordID: recordId
    });

    let record = response.data[0];
    
    // 2. Access the subform using its exact API Name (replace 'Subform_API_Name')
    // Check Settings > Setup > Customization > Modules > Accounts to find the API Name
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



function openPopup(id){
document.getElementById(id).style.display="flex";

if(id=="dreams"){
loadDreams();
}
if(id=="viewTrips"){
loadTrips();
}
}
function autoSaveMember(){

let data={
Full_Name:fullName.value,
DOB:dob.value,
Contact_Number:phone.value,
Email:email.value,
Address:address.value
};

ZOHO.CRM.API.updateRecord({
Entity:"Accounts",
APIData:data,
RecordID:recordId
});

console.log("Auto saved");
}

function autoSaveDocs(){

let data={
Passport_Number:passport.value,
Passport_Expiry_Date:expiry.value,
Passport_Issued_Country:country.value
};

ZOHO.CRM.API.updateRecord({
Entity:"Accounts",
APIData:data,
RecordID:recordId
});
}




