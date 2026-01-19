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

function editCard(cardId, label) {
    const popup = document.createElement("div");
    popup.classList.add("popup");
    popup.id = "editCardPopup";
    popup.innerHTML = `
        <div class="popCard">
            <h3>Edit ${label}</h3>
            <input id="editCardValue" type="number" placeholder="Enter value">
            <button onclick="saveCard('${cardId}')">Save</button>
            <button onclick="closeEditCard()">Close</button>
        </div>
    `;
    document.body.appendChild(popup);
    popup.style.display = "flex";

    // Pre-fill current value
    document.getElementById("editCardValue").value = document.getElementById(cardId).innerText.replace(/[^0-9.]/g,'');
}

function closeEditCard() {
    const popup = document.getElementById("editCardPopup");
    if (popup) popup.remove();
}

function saveCard(cardId) {
    const value = document.getElementById("editCardValue").value;
    let data = { id: recordId };

    switch(cardId){
        case "lifeSave": data.Lifetime_Savings = value; break;
        case "ytd": data.Year_To_Date_Savings = value; break;
        case "avg": data.Average_Savings_Per_Trip = value; break;
        case "bookings": data.Total_Bookings = value; break;
    }

    ZOHO.CRM.API.updateRecord({
        Entity: "Accounts",
        APIData: data
    }).then(() => {
        alert("Card updated ✔");
        closeEditCard();
        loadAccount(); // refresh top cards
    });
}

function closePop(){
document.querySelectorAll('.popup').forEach(p=>p.style.display="none");
}
let recordId;

/* INIT */
ZOHO.embeddedApp.on("PageLoad", function (data) {

  // ✅ SAFELY resize (non-blocking)
  try {
    ZOHO.CRM.UI.Resize({
      width: 1100,
      height: 700
    });
  } catch (e) {
    console.warn("Resize skipped:", e);
  }

  // ✅ SAFETY CHECK
  if (!data || !data.EntityId || !data.EntityId.length) {
    console.error("EntityId not available", data);
    return; // ⛔ STOP if context missing
  }

  recordId = data.EntityId[0];

  // ✅ Load only after context confirmed
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
Entity:"Accounts",
RecordID:recordId,
RelatedList:"Trips1"
}).then(res=>{

allTrips.innerHTML="";

if(!res.data || res.data.length==0){
allTrips.innerHTML="<p>No trips found</p>";
return;
}

res.data.forEach(t=>{

allTrips.innerHTML+=`
<div class="tripCard">
<b>${t.Name || "No Destination"}</b><br>
${t.Start_Date || "-"} → ${t.End_Date || "-"}<br>
<b>Budget:</b> ₹${t.Trip_Cost || 0}<br>

<button onclick="openEditTrip('${t.id}','${t.Name}','${t.Start_Date}','${t.End_Date}','${t.Trip_Cost}')">Edit</button>

<button onclick="deleteTrip('${t.id}')">Delete</button>
</div>`;
});

});
}

let editTripId;

function openEditTrip(id,name,sd,ed,budget){

editTripId=id;

edit_dest.value=name;
edit_sdate.value=sd;
edit_edate.value=ed;
edit_budget.value=budget;

/* CLOSE VIEW POPUP */
document.getElementById("viewTrips").style.display="none";

/* OPEN EDIT POPUP */
document.getElementById("editTrip").style.display="flex";
}

function updateTrip(){

let data={
id:editTripId,
Name:edit_dest.value,
Start_Date:edit_sdate.value,
End_Date:edit_edate.value,
Trip_Cost:edit_budget.value
};

ZOHO.CRM.API.updateRecord({
Entity:"Trips",
APIData:data
}).then(()=>{
closePop();
loadTrips();

});
}

function deleteTrip(id){

ZOHO.CRM.API.deleteRecord({
Entity:"Trips",
RecordID:id
}).then(()=>{
loadTrips();

});
}


function saveTrip(){

let d={
    Name: document.getElementById("dest").value,
    Start_Date: document.getElementById("sdate").value,
    End_Date: document.getElementById("edate").value,
    Trip_Cost: document.getElementById("budget").value,

    // 🔴 IMPORTANT - LINK TO ACCOUNT
    Trip_Account: {
        id: recordId
    }
};

ZOHO.CRM.API.insertRecord({
    Entity:"Trips",
    APIData:d
}).then(function(res){

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
    let dreamsSubform = record.Dream_Place;

    let dreamList = document.getElementById("dreamList");
    dreamList.innerHTML = "";

    if (!dreamsSubform || dreamsSubform.length === 0) {
        dreamList.innerHTML = "<p>No dream destinations added</p>";
        return;
    }

    dreamsSubform.forEach((row, index) => {
        dreamList.innerHTML += `
        <div class="dreamCard">
            <b>Destination:</b> ${row.Dream_Destination_Name || "-"}<br>
            <b>Month:</b> ${row.Target_Month || "-"}<br>
            <b>Year:</b> ${row.Target_Year || "-"}<br>
            <b>Priority:</b> ${row.Priority || "-"}<br>
            <b>Estimated Cost:</b> ₹${row.Estimated_Cost || "0"}<br>
            <div class="dreamActions">
                <button onclick="editDream(${index})">Edit</button>
                <button onclick="deleteDream(${index})">Delete</button>
            </div>
        </div>
        `;
    });
}

let currentDreamIndex = null;

function editDream(index) {
    currentDreamIndex = index;
    // Load current data into popup inputs
    const popup = document.createElement("div");
    popup.classList.add("popup");
    popup.id = "editDreamPopup";
    popup.innerHTML = `
        <div class="popCard">
            <h3>Edit Dream Destination</h3>
            <input id="editDreamName" placeholder="Destination Name">
            <input id="editDreamMonth" placeholder="Target Month">
            <input id="editDreamYear" placeholder="Target Year">
            <input id="editDreamPriority" placeholder="Priority">
            <input id="editDreamCost" placeholder="Estimated Cost">
            <button onclick="saveDream()">Save</button>
            <button onclick="closeEditDream()">Close</button>
        </div>
    `;
    document.body.appendChild(popup);

    // Pre-fill values
    ZOHO.CRM.API.getRecord({
        Entity: "Accounts",
        RecordID: recordId
    }).then(res => {
        let row = res.data[0].Dream_Place[currentDreamIndex];
        document.getElementById("editDreamName").value = row.Dream_Destination_Name || "";
        document.getElementById("editDreamMonth").value = row.Target_Month || "";
        document.getElementById("editDreamYear").value = row.Target_Year || "";
        document.getElementById("editDreamPriority").value = row.Priority || "";
        document.getElementById("editDreamCost").value = row.Estimated_Cost || "";
    });

    popup.style.display = "flex";
}

function closeEditDream() {
    const popup = document.getElementById("editDreamPopup");
    if (popup) popup.remove();
}

function saveDream() {
    // Collect new data
    let updated = {
        Dream_Destination_Name: document.getElementById("editDreamName").value,
        Target_Month: document.getElementById("editDreamMonth").value,
        Target_Year: document.getElementById("editDreamYear").value,
        Priority: document.getElementById("editDreamPriority").value,
        Estimated_Cost: document.getElementById("editDreamCost").value
    };

    // Get current record
    ZOHO.CRM.API.getRecord({
        Entity: "Accounts",
        RecordID: recordId
    }).then(res => {
        let dreams = res.data[0].Dream_Place || [];
        dreams[currentDreamIndex] = updated;

        ZOHO.CRM.API.updateRecord({
            Entity: "Accounts",
            APIData: { id: recordId, Dream_Place: dreams }
        }).then(() => {
            closeEditDream();
            loadDreams();
        });
    });
}

function deleteDream(index) {

    ZOHO.CRM.API.getRecord({
        Entity: "Accounts",
        RecordID: recordId
    }).then(res => {
        let dreams = res.data[0].Dream_Place || [];
        dreams.splice(index, 1);

        ZOHO.CRM.API.updateRecord({
            Entity: "Accounts",
            APIData: { id: recordId, Dream_Place: dreams }
        }).then(() => {
            loadDreams();
        });
    });
}

function addDreamPopup() {
    const popup = document.createElement("div");
    popup.classList.add("popup");
    popup.id = "addDreamPopup";
    popup.innerHTML = `
        <div class="popCard">
            <h3>Add New Dream Destination</h3>
            <input id="newDreamName" placeholder="Destination Name">
            <input id="newDreamMonth" placeholder="Target Month">
            <input id="newDreamYear" placeholder="Target Year">
            <input id="newDreamPriority" placeholder="Priority">
            <input id="newDreamCost" placeholder="Estimated Cost">
            <button onclick="saveNewDream()">Save</button>
            <button onclick="closeAddDream()">Close</button>
        </div>
    `;
    document.body.appendChild(popup);
    popup.style.display = "flex";
}

function closeAddDream() {
    const popup = document.getElementById("addDreamPopup");
    if (popup) popup.remove();
}

function saveNewDream() {
    const newDream = {
        Dream_Destination_Name: document.getElementById("newDreamName").value,
        Target_Month: document.getElementById("newDreamMonth").value,
        Target_Year: document.getElementById("newDreamYear").value,
        Priority: document.getElementById("newDreamPriority").value,
        Estimated_Cost: document.getElementById("newDreamCost").value
    };

    ZOHO.CRM.API.getRecord({
        Entity: "Accounts",
        RecordID: recordId
    }).then(res => {
        const dreams = res.data[0].Dream_Place || [];
        dreams.push(newDream);

        ZOHO.CRM.API.updateRecord({
            Entity: "Accounts",
            APIData: { id: recordId, Dream_Place: dreams }
        }).then(() => {
            closeAddDream();
            loadDreams(); // refresh dream list
        });
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








