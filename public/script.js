/* =====================================================
   SMARTATTEND 360
   FRONTEND JAVASCRIPT
   MongoDB Connected Version
===================================================== */


/* =====================================================
   STORAGE KEYS
===================================================== */

const ATTENDANCE_KEY = "smartattend_attendance";
const GOAL_KEY = "smartattend_goal";
const DARK_KEY = "smartattend_dark";


/* =====================================================
   BACKEND API
===================================================== */

const API_URL = "http://localhost:5000/api";


/* =====================================================
   LOCAL DATA
   Attendance and settings remain in localStorage
===================================================== */

let students = [];

let attendance =
    JSON.parse(
        localStorage.getItem(ATTENDANCE_KEY)
    ) || {};

let attendanceGoal =
    Number(
        localStorage.getItem(GOAL_KEY)
    ) || 75;


/* =====================================================
   SAVE LOCAL DATA
===================================================== */

function saveData() {

    localStorage.setItem(
        ATTENDANCE_KEY,
        JSON.stringify(attendance)
    );

    localStorage.setItem(
        GOAL_KEY,
        attendanceGoal
    );
}


/* =====================================================
   API HELPER
===================================================== */

async function apiRequest(url, options = {}) {

    const response = await fetch(
        url,
        {
            ...options,

            headers: {
                "Content-Type": "application/json",
                ...(options.headers || {})
            }
        }
    );

    let data = {};

    try {
        data = await response.json();
    }

    catch (error) {
        data = {};
    }

    if (!response.ok) {

        throw new Error(
            data.message ||
            data.error ||
            `Request failed with status ${response.status}`
        );

    }

    return data;
}


/* =====================================================
   CONVERT MONGODB STUDENT
   TO FRONTEND STUDENT FORMAT
===================================================== */

function convertStudent(student) {

    return {

        id:
            student._id ||
            student.id,

        roll:
            student.rollNumber ||
            student.roll ||
            "",

        name:
            student.name ||
            "",

        department:
            student.department ||
            "",

        year:
            student.year ||
            "",

        email:
            student.email ||
            "",

        phone:
            student.phone ||
            ""

    };
}


/* =====================================================
   LOAD STUDENTS FROM MONGODB
===================================================== */

async function loadStudentsFromBackend() {

    try {

        const data =
            await apiRequest(
                `${API_URL}/students`
            );


        /*
           Your backend may return:

           [
              {...},
              {...}
           ]

           OR:

           {
              students: [...]
           }

           This code supports both.
        */

        const studentList =
            Array.isArray(data)
                ? data
                : (
                    data.students ||
                    data.data ||
                    []
                );


        students =
            studentList.map(
                convertStudent
            );


        console.log(
            "Students loaded from MongoDB:",
            students
        );


        updateDepartmentFilters();

        renderAll();

    }

    catch (error) {

        console.error(
            "LOAD STUDENTS ERROR:",
            error
        );


        students = [];


        alert(
            "Unable to load students from MongoDB.\n\n" +
            "Please make sure your backend is running:\n" +
            "node server.js\n\n" +
            "Error: " +
            error.message
        );


        renderAll();

    }

}


/* =====================================================
   DATE
===================================================== */

function getToday() {

    const date = new Date();

    const year =
        date.getFullYear();

    const month =
        String(
            date.getMonth() + 1
        ).padStart(2, "0");

    const day =
        String(
            date.getDate()
        ).padStart(2, "0");

    return `${year}-${month}-${day}`;
}


function formatDate(dateString) {

    if (!dateString) return "";

    const date =
        new Date(
            dateString + "T00:00:00"
        );

    return date.toLocaleDateString(
        "en-IN",
        {
            day: "2-digit",
            month: "short",
            year: "numeric"
        }
    );
}


/* =====================================================
   DOM READY
===================================================== */

document.addEventListener(
    "DOMContentLoaded",
    initialize
);


async function initialize() {

    setupNavigation();

    setupQuickActions();

    setupStudents();

    setupAttendance();

    setupCalculators();

    setupGoals();

    setupSettings();

    setupDarkMode();

    setupMobileMenu();

    initializeDates();

    await loadStudentsFromBackend();

    // Load saved notifications
    loadNotifications();

}

/* =====================================================
   NAVIGATION
===================================================== */

const pageNames = {

    dashboard: [
        "Dashboard",
        "Smart attendance overview"
    ],

    students: [
        "Students",
        "Manage student records"
    ],

    attendance: [
        "Attendance",
        "Mark daily attendance"
    ],

    insights: [
        "Smart Insights",
        "AI-style attendance intelligence"
    ],

    calculator: [
        "Can I Miss?",
        "Attendance calculation assistant"
    ],

    recovery: [
        "Recovery Planner",
        "Plan your attendance recovery"
    ],

    goals: [
        "Attendance Goal",
        "Set and track your target"
    ],

    risk: [
        "Risk Monitor",
        "Identify students needing attention"
    ],

    analytics: [
        "Analytics",
        "Attendance performance analysis"
    ],

    settings: [
        "Settings",
        "Manage application preferences"
    ]

};


function setupNavigation() {

    document
        .querySelectorAll(
            ".nav-item[data-page]"
        )
        .forEach(button => {

            button.addEventListener(
                "click",
                () => {

                    const page =
                        button.dataset.page;

                    showPage(page);

                }
            );

        });

}


function showPage(pageName) {

    document
        .querySelectorAll(".page")
        .forEach(page => {

            page.classList.remove(
                "active-page"
            );

        });


    const target =
        document.getElementById(
            pageName + "Page"
        );


    if (target) {

        target.classList.add(
            "active-page"
        );

    }


    document
        .querySelectorAll(
            ".nav-item[data-page]"
        )
        .forEach(button => {

            button.classList.toggle(
                "active",
                button.dataset.page === pageName
            );

        });


    const details =
        pageNames[pageName];


    if (details) {

        const title =
            document.getElementById(
                "pageTitle"
            );

        const subtitle =
            document.getElementById(
                "pageSubtitle"
            );


        if (title) {

            title.textContent =
                details[0];

        }


        if (subtitle) {

            subtitle.textContent =
                details[1];

        }

    }


    closeMobileMenu();


    if (pageName === "insights") {

        renderSmartInsights();

    }


    if (pageName === "risk") {

        renderRiskMonitor();

    }


    if (pageName === "analytics") {

        renderAnalytics();

    }


    if (pageName === "goals") {

        renderGoal();

    }

}


/* =====================================================
   QUICK ACTIONS
===================================================== */

function setupQuickActions() {

    document
        .querySelectorAll("[data-go]")
        .forEach(button => {

            button.addEventListener(
                "click",
                () => {

                    showPage(
                        button.dataset.go
                    );

                }
            );

        });

}


/* =====================================================
   STUDENT MANAGEMENT
===================================================== */

function setupStudents() {

    const addButton =
        document.getElementById(
            "addStudentBtn"
        );

    if (addButton) {

        addButton.addEventListener(
            "click",
            () => openStudentModal()
        );

    }


    const closeButton =
        document.getElementById(
            "closeModal"
        );

    if (closeButton) {

        closeButton.addEventListener(
            "click",
            closeStudentModal
        );

    }


    const cancelButton =
        document.getElementById(
            "cancelModal"
        );

    if (cancelButton) {

        cancelButton.addEventListener(
            "click",
            closeStudentModal
        );

    }


    const form =
        document.getElementById(
            "studentForm"
        );

    if (form) {

        form.addEventListener(
            "submit",
            saveStudent
        );

    }


    const search =
        document.getElementById(
            "studentSearch"
        );

    if (search) {

        search.addEventListener(
            "input",
            renderStudents
        );

    }


    const department =
        document.getElementById(
            "departmentFilter"
        );

    if (department) {

        department.addEventListener(
            "change",
            renderStudents
        );

    }


    const clearSearch =
        document.getElementById(
            "clearSearch"
        );

    if (clearSearch) {

        clearSearch.addEventListener(
            "click",
            () => {

                const searchBox =
                    document.getElementById(
                        "studentSearch"
                    );

                const departmentBox =
                    document.getElementById(
                        "departmentFilter"
                    );


                if (searchBox) {

                    searchBox.value = "";

                }


                if (departmentBox) {

                    departmentBox.value = "all";

                }


                renderStudents();

            }
        );

    }

}


/* =====================================================
   OPEN STUDENT MODAL
===================================================== */

function openStudentModal(student = null) {

    const modal =
        document.getElementById(
            "studentModal"
        );


    if (!modal) return;


    modal.classList.add("show");


    if (student) {

        document.getElementById(
            "modalTitle"
        ).textContent =
            "Edit Student";


        document.getElementById(
            "editStudentId"
        ).value =
            student.id;


        document.getElementById(
            "studentRoll"
        ).value =
            student.roll;


        document.getElementById(
            "studentName"
        ).value =
            student.name;


        document.getElementById(
            "studentDepartment"
        ).value =
            student.department;


        document.getElementById(
            "studentYear"
        ).value =
            student.year;

    }

    else {

        document.getElementById(
            "modalTitle"
        ).textContent =
            "Add Student";


        document.getElementById(
            "studentForm"
        ).reset();


        document.getElementById(
            "editStudentId"
        ).value = "";

    }

}


/* =====================================================
   CLOSE STUDENT MODAL
===================================================== */

function closeStudentModal() {

    const modal =
        document.getElementById(
            "studentModal"
        );


    if (modal) {

        modal.classList.remove(
            "show"
        );

    }

}


/* =====================================================
   CREATE / UPDATE STUDENT
===================================================== */

async function saveStudent(event) {

    event.preventDefault();


    const editId =
        document.getElementById(
            "editStudentId"
        ).value;


    const roll =
        document.getElementById(
            "studentRoll"
        ).value.trim();


    const name =
        document.getElementById(
            "studentName"
        ).value.trim();


    const department =
        document.getElementById(
            "studentDepartment"
        ).value;


    const year =
        document.getElementById(
            "studentYear"
        ).value;


    if (!roll || !name) {

        alert(
            "Please enter roll number and student name."
        );

        return;

    }


    /* =================================================
       DUPLICATE CHECK
    ================================================= */

    const duplicate =
        students.find(
            student =>

                student.roll &&
                student.roll.toLowerCase() ===
                roll.toLowerCase() &&

                student.id !== editId
        );


    if (duplicate) {

        alert(
            "This roll number already exists."
        );

        return;

    }


    /* =================================================
       UPDATE
    ================================================= */

    if (editId) {

        try {

            const existingStudent =
                students.find(
                    student =>
                        student.id === editId
                );


            const updatedStudent = {

                name: name,

                rollNumber: roll,

                department: department,

                year: year,

                email:
                    existingStudent?.email || "",

                phone:
                    existingStudent?.phone || ""

            };


            await apiRequest(
                `${API_URL}/students/${editId}`,
                {
                    method: "PUT",

                    body:
                        JSON.stringify(
                            updatedStudent
                        )
                }
            );


            alert(
                "Student updated successfully."
            );


            closeStudentModal();


            await loadStudentsFromBackend();

        }

        catch (error) {

            console.error(
                "UPDATE ERROR:",
                error
            );


            alert(
                "Unable to update student.\n\n" +
                error.message
            );

        }


        return;

    }


    /* =================================================
       CREATE
    ================================================= */

    try {

        const newStudent = {

            name: name,

            rollNumber: roll,

            department: department,

            year: year,

            email: "",

            phone: ""

        };


        await apiRequest(
            `${API_URL}/students`,
            {
                method: "POST",

                body:
                    JSON.stringify(
                        newStudent
                    )
            }
        );


        alert(
            "Student added successfully to MongoDB."
        );


        closeStudentModal();


        await loadStudentsFromBackend();

    }

    catch (error) {

        console.error(
            "CREATE ERROR:",
            error
        );


        alert(
            "Unable to add student.\n\n" +
            error.message
        );

    }

}


/* =====================================================
   EDIT STUDENT
===================================================== */

function editStudent(id) {

    const student =
        students.find(
            student =>
                student.id === id
        );


    if (student) {

        openStudentModal(
            student
        );

    }

}


/* =====================================================
   DELETE STUDENT
===================================================== */

async function deleteStudent(id) {

    const student =
        students.find(
            student =>
                student.id === id
        );


    if (!student) return;


    const confirmDelete =
        confirm(
            `Delete ${student.name} permanently from MongoDB?`
        );


    if (!confirmDelete) return;


    try {

        await apiRequest(
            `${API_URL}/students/${id}`,
            {
                method: "DELETE"
            }
        );


        Object.keys(attendance)
            .forEach(key => {

                if (
                    attendance[key] &&
                    attendance[key][id]
                ) {

                    delete attendance[key][id];

                }

            });


        saveData();


        alert(
            "Student deleted successfully from MongoDB."
        );


        await loadStudentsFromBackend();

    }

    catch (error) {

        console.error(
            "DELETE ERROR:",
            error
        );


        alert(
            "Unable to delete student.\n\n" +
            error.message
        );

    }

}


/* =====================================================
   STUDENT ATTENDANCE
===================================================== */

function getStudentRecords(studentId) {

    const records = [];


    Object.keys(attendance)
        .forEach(key => {

            const day =
                attendance[key];


            if (
                day &&
                day[studentId]
            ) {

                records.push(
                    day[studentId]
                );

            }

        });


    return records;

}


function getStudentAttendance(studentId) {

    const records =
        getStudentRecords(
            studentId
        );


    let present = 0;
    let absent = 0;
    let late = 0;


    records.forEach(status => {

        if (status === "Present") {

            present++;

        }

        else if (status === "Absent") {

            absent++;

        }

        else if (status === "Late") {

            late++;

        }

    });


    const total =
        present +
        absent +
        late;


    const percentage =
        total === 0
            ? 0
            :
            (
                (present + late) /
                total
            ) * 100;


    return {

        present,

        absent,

        late,

        total,

        percentage:
            Number(
                percentage.toFixed(1)
            )

    };

}


/* =====================================================
   STUDENT RENDER
===================================================== */

function renderStudents() {

    const tbody =
        document.getElementById(
            "studentsTableBody"
        );


    if (!tbody) return;


    const searchElement =
        document.getElementById(
            "studentSearch"
        );


    const departmentElement =
        document.getElementById(
            "departmentFilter"
        );


    const search =
        searchElement
            ? searchElement.value
                .toLowerCase()
                .trim()
            : "";


    const department =
        departmentElement
            ? departmentElement.value
            : "all";


    const filtered =
        students.filter(
            student => {

                const studentName =
                    String(
                        student.name || ""
                    ).toLowerCase();


                const studentRoll =
                    String(
                        student.roll || ""
                    ).toLowerCase();


                const matchesSearch =

                    studentName.includes(
                        search
                    )

                    ||

                    studentRoll.includes(
                        search
                    );


                const matchesDepartment =

                    department === "all"

                    ||

                    student.department ===
                    department;


                return (
                    matchesSearch &&
                    matchesDepartment
                );

            }
        );


    tbody.innerHTML = "";


    filtered.forEach(
        student => {

            const data =
                getStudentAttendance(
                    student.id
                );


            const status =
                getRiskLevel(
                    data.percentage
                );


            const row =
                document.createElement(
                    "tr"
                );


            row.innerHTML = `

                <td>
                    <strong>
                        ${escapeHTML(
                            student.roll
                        )}
                    </strong>
                </td>

                <td class="student-name">
                    ${escapeHTML(
                        student.name
                    )}
                </td>

                <td>
                    ${escapeHTML(
                        student.department
                    )}
                </td>

                <td>
                    ${escapeHTML(
                        student.year
                    )}
                </td>

                <td>
                    <strong>
                        ${data.percentage}%
                    </strong>
                </td>

                <td>
                    <span
                        class="badge ${status.class}"
                    >
                        ${status.label}
                    </span>
                </td>

                <td>

                    <div class="table-actions">

                        <button
                            class="icon-btn"
                            title="Edit"
                            onclick="editStudent('${student.id}')"
                        >
                            ✎
                        </button>

                        <button
                            class="icon-btn delete-btn"
                            title="Delete"
                            onclick="deleteStudent('${student.id}')"
                        >
                            🗑
                        </button>

                    </div>

                </td>

            `;


            tbody.appendChild(
                row
            );

        }
    );


    const empty =
        document.getElementById(
            "emptyStudents"
        );


    if (empty) {

        empty.style.display =
            filtered.length === 0
                ? "block"
                : "none";

    }

}


/* =====================================================
   DEPARTMENT FILTERS
===================================================== */

function updateDepartmentFilters() {

    const departmentFilter =
        document.getElementById(
            "departmentFilter"
        );


    const attendanceDepartment =
        document.getElementById(
            "attendanceDepartment"
        );


    if (
        !departmentFilter ||
        !attendanceDepartment
    ) {

        return;

    }


    const departments =
        [
            ...new Set(
                students.map(
                    student =>
                        student.department
                )
            )
        ]
        .filter(Boolean)
        .sort();


    const currentStudentDepartment =
        departmentFilter.value;


    const currentAttendanceDepartment =
        attendanceDepartment.value;


    departmentFilter.innerHTML =
        `
            <option value="all">
                All Departments
            </option>
        `;


    attendanceDepartment.innerHTML =
        `
            <option value="all">
                All Departments
            </option>
        `;


    departments.forEach(
        dept => {

            departmentFilter.innerHTML +=
                `
                    <option value="${escapeHTML(dept)}">
                        ${escapeHTML(dept)}
                    </option>
                `;


            attendanceDepartment.innerHTML +=
                `
                    <option value="${escapeHTML(dept)}">
                        ${escapeHTML(dept)}
                    </option>
                `;

        }
    );


    if (
        departments.includes(
            currentStudentDepartment
        )
    ) {

        departmentFilter.value =
            currentStudentDepartment;

    }


    if (
        departments.includes(
            currentAttendanceDepartment
        )
    ) {

        attendanceDepartment.value =
            currentAttendanceDepartment;

    }

}


/* =====================================================
   ATTENDANCE
===================================================== */

function setupAttendance() {

    const date =
        document.getElementById(
            "attendanceDate"
        );


    if (date) {

        date.addEventListener(
            "change",
            renderAttendance
        );

    }


    const subject =
        document.getElementById(
            "subjectSelect"
        );


    if (subject) {

        subject.addEventListener(
            "change",
            renderAttendance
        );

    }


    const department =
        document.getElementById(
            "attendanceDepartment"
        );


    if (department) {

        department.addEventListener(
            "change",
            renderAttendance
        );

    }


    const exportButton =
        document.getElementById(
            "exportCsvBtn"
        );


    if (exportButton) {

        exportButton.addEventListener(
            "click",
            exportCSV
        );

    }

}


/* =====================================================
   INITIALIZE DATES
===================================================== */

function initializeDates() {

    const today =
        getToday();


    const todayDate =
        document.getElementById(
            "todayDate"
        );


    if (todayDate) {

        todayDate.textContent =
            formatDate(today);

    }


    const attendanceDate =
        document.getElementById(
            "attendanceDate"
        );


    if (attendanceDate) {

        attendanceDate.value =
            today;

    }

}


/* =====================================================
   ATTENDANCE KEY
===================================================== */

function getAttendanceKey(
    date,
    subject
) {

    return `${date}__${subject}`;

}


/* =====================================================
   SET ATTENDANCE
===================================================== */

function setAttendance(
    studentId,
    status
) {

    const date =
        document.getElementById(
            "attendanceDate"
        ).value;


    const subject =
        document.getElementById(
            "subjectSelect"
        ).value;


    if (!date || !subject) {

        alert(
            "Please select date and subject."
        );

        return;

    }


    const key =
        getAttendanceKey(
            date,
            subject
        );


    if (!attendance[key]) {

        attendance[key] = {};

    }


    attendance[key][studentId] =
        status;


    saveData();

    renderAttendance();

    renderAll();

}


/* =====================================================
   RENDER ATTENDANCE
===================================================== */

function renderAttendance() {

    const tbody =
        document.getElementById(
            "attendanceTableBody"
        );


    if (!tbody) return;


    const dateElement =
        document.getElementById(
            "attendanceDate"
        );


    const subjectElement =
        document.getElementById(
            "subjectSelect"
        );


    const departmentElement =
        document.getElementById(
            "attendanceDepartment"
        );


    if (
        !dateElement ||
        !subjectElement ||
        !departmentElement
    ) {

        return;

    }


    const date =
        dateElement.value;


    const subject =
        subjectElement.value;


    const department =
        departmentElement.value;


    const key =
        getAttendanceKey(
            date,
            subject
        );


    const dayAttendance =
        attendance[key] || {};


    const filtered =
        students.filter(
            student =>
                department === "all" ||
                student.department === department
        );


    tbody.innerHTML = "";


    let present = 0;
    let absent = 0;
    let late = 0;
    let notMarked = 0;


    filtered.forEach(
        student => {

            const status =
                dayAttendance[
                    student.id
                ] ||
                "Not Marked";


            if (
                status === "Present"
            ) {

                present++;

            }

            else if (
                status === "Absent"
            ) {

                absent++;

            }

            else if (
                status === "Late"
            ) {

                late++;

            }

            else {

                notMarked++;

            }


            const row =
                document.createElement(
                    "tr"
                );


            row.innerHTML = `

                <td>
                    <strong>
                        ${escapeHTML(
                            student.roll
                        )}
                    </strong>
                </td>

                <td class="student-name">
                    ${escapeHTML(
                        student.name
                    )}
                </td>

                <td>
                    ${escapeHTML(
                        student.department
                    )}
                </td>

                <td>

                    <div
                        class="attendance-buttons"
                    >

                        <button
                            class="
                                att-btn
                                present
                                ${status === "Present"
                                    ? "active"
                                    : ""}
                            "
                            onclick="setAttendance('${student.id}','Present')"
                        >
                            Present
                        </button>

                        <button
                            class="
                                att-btn
                                absent
                                ${status === "Absent"
                                    ? "active"
                                    : ""}
                            "
                            onclick="setAttendance('${student.id}','Absent')"
                        >
                            Absent
                        </button>

                        <button
                            class="
                                att-btn
                                late
                                ${status === "Late"
                                    ? "active"
                                    : ""}
                            "
                            onclick="setAttendance('${student.id}','Late')"
                        >
                            Late
                        </button>

                    </div>

                </td>

            `;


            tbody.appendChild(
                row
            );

        }
    );


    const presentElement =
        document.getElementById(
            "attendancePresentCount"
        );


    if (presentElement) {

        presentElement.textContent =
            present;

    }


    const absentElement =
        document.getElementById(
            "attendanceAbsentCount"
        );


    if (absentElement) {

        absentElement.textContent =
            absent;

    }


    const lateElement =
        document.getElementById(
            "attendanceLateCount"
        );


    if (lateElement) {

        lateElement.textContent =
            late;

    }


    const notMarkedElement =
        document.getElementById(
            "attendanceNotMarkedCount"
        );


    if (notMarkedElement) {

        notMarkedElement.textContent =
            notMarked;

    }

}


/* =====================================================
   DASHBOARD
===================================================== */

function updateDashboard() {

    const totalStudents =
        students.length;


    const today =
        getToday();


    let present = 0;
    let absent = 0;


    Object.keys(attendance)
        .forEach(
            key => {

                if (
                    key.startsWith(
                        today + "__"
                    )
                ) {

                    Object.values(
                        attendance[key]
                    )
                    .forEach(
                        status => {

                            if (
                                status ===
                                "Present"
                            ) {

                                present++;

                            }


                            if (
                                status ===
                                "Absent"
                            ) {

                                absent++;

                            }

                        }
                    );

                }

            }
        );


    const allRecords =
        getAllAttendanceStats();


    const totalStudentsElement =
        document.getElementById(
            "totalStudents"
        );


    if (totalStudentsElement) {

        totalStudentsElement.textContent =
            totalStudents;

    }


    const todayPresent =
        document.getElementById(
            "todayPresent"
        );


    if (todayPresent) {

        todayPresent.textContent =
            present;

    }


    const todayAbsent =
        document.getElementById(
            "todayAbsent"
        );


    if (todayAbsent) {

        todayAbsent.textContent =
            absent;

    }


    const overallPercentage =
        document.getElementById(
            "overallPercentage"
        );


    if (overallPercentage) {

        overallPercentage.textContent =
            allRecords.percentage + "%";

    }


    const bigPercentage =
        document.getElementById(
            "dashboardBigPercentage"
        );


    if (bigPercentage) {

        bigPercentage.textContent =
            allRecords.percentage + "%";

    }


    const progress =
        document.getElementById(
            "dashboardProgress"
        );


    if (progress) {

        progress.style.width =
            allRecords.percentage + "%";

    }


    const insight =
        document.getElementById(
            "dashboardInsight"
        );


    if (insight) {

        insight.textContent =
            generateMainInsight();

    }

}


/* =====================================================
   GLOBAL ATTENDANCE STATS
===================================================== */

function getAllAttendanceStats() {

    let present = 0;
    let absent = 0;
    let late = 0;


    Object.values(attendance)
        .forEach(
            day => {

                Object.values(day)
                    .forEach(
                        status => {

                            if (
                                status ===
                                "Present"
                            ) {

                                present++;

                            }

                            else if (
                                status ===
                                "Absent"
                            ) {

                                absent++;

                            }

                            else if (
                                status ===
                                "Late"
                            ) {

                                late++;

                            }

                        }
                    );

            }
        );


    const total =
        present +
        absent +
        late;


    const percentage =
        total === 0
            ? 0
            :
            (
                (present + late) /
                total
            ) * 100;


    return {

        present,

        absent,

        late,

        total,

        percentage:
            Number(
                percentage.toFixed(1)
            )

    };

}


/* =====================================================
   SMART INSIGHTS
===================================================== */

function generateMainInsight() {

    const stats =
        getAllAttendanceStats();


    if (stats.total === 0) {

        return (
            "No attendance data available yet. " +
            "Start marking attendance to generate smart insights."
        );

    }


    if (
        stats.percentage >= 90
    ) {

        return (
            "Excellent attendance trend. " +
            "The current attendance level is above 90%."
        );

    }


    if (
        stats.percentage >= 75
    ) {

        return (
            "Overall attendance is currently meeting " +
            "the common 75% target. Continue maintaining regular attendance."
        );

    }


    return (
        "Overall attendance is below 75%. " +
        "Students with lower attendance should be identified and monitored."
    );

}


function renderSmartInsights() {

    const container =
        document.getElementById(
            "smartInsights"
        );


    if (!container) return;


    const stats =
        getAllAttendanceStats();


    const highest =
        getHighestAttendance();


    const lowest =
        getLowestAttendance();


    const atRisk =
        students.filter(
            student => {

                const data =
                    getStudentAttendance(
                        student.id
                    );


                return (
                    data.total > 0 &&
                    data.percentage < 75
                );

            }
        );


    container.innerHTML = `

        <div class="smart-insight">

            <div class="insight-icon">
                📊
            </div>

            <h3>
                Overall Trend
            </h3>

            <p>
                Current overall attendance is
                <strong>
                    ${stats.percentage}%
                </strong>.

                ${
                    stats.percentage >= 75
                        ? "The overall level is currently at or above the 75% target."
                        : "The overall level is currently below the 75% target."
                }

            </p>

        </div>


        <div class="smart-insight">

            <div class="insight-icon">
                🏆
            </div>

            <h3>
                Highest Attendance
            </h3>

            <p>

                ${
                    highest

                        ? `
                            ${escapeHTML(
                                highest.student.name
                            )}
                            has the highest attendance at
                            ${highest.data.percentage}%.
                          `

                        : "No attendance records available yet."
                }

            </p>

        </div>


        <div class="smart-insight">

            <div class="insight-icon">
                ⚠
            </div>

            <h3>
                Students Needing Attention
            </h3>

            <p>

                ${atRisk.length}

                student(s) currently have attendance
                below 75%.

            </p>

        </div>


        <div class="smart-insight">

            <div class="insight-icon">
                📈
            </div>

            <h3>
                Lowest Attendance
            </h3>

            <p>

                ${
                    lowest

                        ? `
                            ${escapeHTML(
                                lowest.student.name
                            )}
                            currently has
                            ${lowest.data.percentage}% attendance.
                          `

                        : "No attendance records available yet."
                }

            </p>

        </div>

    `;

}


function getHighestAttendance() {

    let result = null;


    students.forEach(
        student => {

            const data =
                getStudentAttendance(
                    student.id
                );


            if (
                data.total === 0
            ) return;


            if (
                !result ||
                data.percentage >
                result.data.percentage
            ) {

                result = {

                    student,

                    data

                };

            }

        }
    );


    return result;

}


function getLowestAttendance() {

    let result = null;


    students.forEach(
        student => {

            const data =
                getStudentAttendance(
                    student.id
                );


            if (
                data.total === 0
            ) return;


            if (
                !result ||
                data.percentage <
                result.data.percentage
            ) {

                result = {

                    student,

                    data

                };

            }

        }
    );


    return result;

}


/* =====================================================
   CAN I MISS CALCULATOR
===================================================== */

function setupCalculators() {

    const calculateButton =
        document.getElementById(
            "calculateMissBtn"
        );


    if (calculateButton) {

        calculateButton.addEventListener(
            "click",
            calculateCanIMiss
        );

    }


    const recoveryButton =
        document.getElementById(
            "recoveryBtn"
        );


    if (recoveryButton) {

        recoveryButton.addEventListener(
            "click",
            calculateRecovery
        );

    }

}


function calculateCanIMiss() {

    const total =
        Number(
            document.getElementById(
                "calcTotal"
            ).value
        );


    const attended =
        Number(
            document.getElementById(
                "calcAttended"
            ).value
        );


    const required =
        Number(
            document.getElementById(
                "calcRequired"
            ).value
        );


    const current =
        total > 0
            ?
            (
                attended /
                total
            ) * 100
            : 0;


    document.getElementById(
        "calcCurrent"
    ).textContent =
        current.toFixed(1) + "%";


    const message =
        document.getElementById(
            "calcMessage"
        );


    const details =
        document.getElementById(
            "calcDetails"
        );


    if (
        total <= 0 ||
        attended < 0 ||
        attended > total ||
        required <= 0 ||
        required > 100
    ) {

        message.textContent =
            "Please enter valid attendance values.";

        details.innerHTML = "";

        return;

    }


    let maxMiss = 0;


    while (
        (
            attended /
            (
                total +
                maxMiss +
                1
            )
        ) * 100 >= required
    ) {

        maxMiss++;


        if (
            maxMiss > 10000
        ) break;

    }


    if (
        current >= required
    ) {

        message.textContent =
            `You can miss approximately ${maxMiss} more class(es) while staying at or above ${required}%.`;

    }

    else {

        message.textContent =
            `You are currently below ${required}%. You should attend upcoming classes to recover.`;

    }


    details.innerHTML = `

        Current attendance:
        <strong>
            ${current.toFixed(1)}%
        </strong>

        <br>

        Required attendance:
        <strong>
            ${required}%
        </strong>

        <br>

        Classes attended:
        <strong>
            ${attended}
        </strong>

        /

        <strong>
            ${total}
        </strong>

    `;

}


/* =====================================================
   RECOVERY PLANNER
===================================================== */

function calculateRecovery() {

    const total =
        Number(
            document.getElementById(
                "recoveryTotal"
            ).value
        );


    const attended =
        Number(
            document.getElementById(
                "recoveryAttended"
            ).value
        );


    const target =
        Number(
            document.getElementById(
                "recoveryTarget"
            ).value
        );


    const result =
        document.getElementById(
            "recoveryResult"
        );


    if (
        total <= 0 ||
        attended < 0 ||
        attended > total ||
        target <= 0 ||
        target > 100
    ) {

        result.textContent =
            "Please enter valid values.";

        return;

    }


    const current =
        (
            attended /
            total
        ) * 100;


    if (
        current >= target
    ) {

        result.innerHTML = `

            <strong>
                Already on target 🎉
            </strong>

            <br><br>

            Current attendance:
            <strong>
                ${current.toFixed(1)}%
            </strong>

            <br>

            Target:
            <strong>
                ${target}%
            </strong>

            <br><br>

            You are already meeting your target.
            Continue attending regularly.

        `;

        return;

    }


    const targetDecimal =
        target / 100;


    const numerator =
        targetDecimal * total -
        attended;


    const denominator =
        1 - targetDecimal;


    let requiredClasses =
        Math.ceil(
            numerator /
            denominator
        );


    if (
        requiredClasses < 0
    ) {

        requiredClasses = 0;

    }


    const futurePercentage =
        (
            (
                attended +
                requiredClasses
            )
            /
            (
                total +
                requiredClasses
            )
        ) * 100;


    result.innerHTML = `

        <span>
            Current Attendance
        </span>

        <strong>
            ${current.toFixed(1)}%
        </strong>

        <span>
            You need to attend
        </span>

        <span class="recovery-number">
            ${requiredClasses}
        </span>

        <span>
            consecutive classes approximately
            to reach ${target}%.
        </span>

        <br>

        After attending them:

        <strong>
            ${futurePercentage.toFixed(1)}%
        </strong>

    `;

}


/* =====================================================
   GOALS
===================================================== */

function setupGoals() {

    const saveButton =
        document.getElementById(
            "saveGoalBtn"
        );


    if (saveButton) {

        saveButton.addEventListener(
            "click",
            saveGoal
        );

    }

}


function saveGoal() {

    const value =
        Number(
            document.getElementById(
                "goalInput"
            ).value
        );


    if (
        value < 1 ||
        value > 100
    ) {

        alert(
            "Attendance goal must be between 1% and 100%."
        );

        return;

    }


    attendanceGoal =
        value;


    localStorage.setItem(
        GOAL_KEY,
        attendanceGoal
    );


    renderGoal();


    alert(
        "Attendance goal saved successfully."
    );

}


function renderGoal() {

    const percentage =
        getAllAttendanceStats()
            .percentage;


    const input =
        document.getElementById(
            "goalInput"
        );


    if (input) {

        input.value =
            attendanceGoal;

    }


    const goalPercentage =
        document.getElementById(
            "goalPercentage"
        );


    if (goalPercentage) {

        goalPercentage.textContent =
            attendanceGoal + "%";

    }


    const progress =
        Math.min(
            100,
            percentage /
            attendanceGoal *
            100
        );


    const progressElement =
        document.getElementById(
            "goalProgress"
        );


    if (progressElement) {

        progressElement.style.width =
            progress + "%";

    }


    let message;


    if (
        percentage >= attendanceGoal
    ) {

        message =
            `Great! Current attendance of ${percentage}% is meeting your ${attendanceGoal}% goal.`;

    }

    else {

        message =
            `Current attendance is ${percentage}%. You need to improve attendance to reach your ${attendanceGoal}% goal.`;

    }


    const messageElement =
        document.getElementById(
            "goalMessage"
        );


    if (messageElement) {

        messageElement.textContent =
            message;

    }

}


/* =====================================================
   RISK MONITOR
===================================================== */

function getRiskLevel(
    percentage
) {

    if (
        percentage >= 75
    ) {

        return {

            label: "Safe",

            class: "safe"

        };

    }


    if (
        percentage >= 60
    ) {

        return {

            label: "Warning",

            class: "warning"

        };

    }


    return {

        label: "Critical",

        class: "danger"

    };

}


function renderRiskMonitor() {

    const tbody =
        document.getElementById(
            "riskTableBody"
        );


    if (!tbody) return;


    tbody.innerHTML = "";


    let safe = 0;
    let warning = 0;
    let critical = 0;


    students.forEach(
        student => {

            const data =
                getStudentAttendance(
                    student.id
                );


            const risk =
                data.total === 0

                    ? {
                        label: "No Data",
                        class: "gray"
                    }

                    : getRiskLevel(
                        data.percentage
                    );


            if (
                risk.label === "Safe"
            ) {

                safe++;

            }

            else if (
                risk.label === "Warning"
            ) {

                warning++;

            }

            else if (
                risk.label === "Critical"
            ) {

                critical++;

            }


            const row =
                document.createElement(
                    "tr"
                );


            row.innerHTML = `

                <td class="student-name">
                    ${escapeHTML(
                        student.name
                    )}
                </td>

                <td>
                    ${escapeHTML(
                        student.roll
                    )}
                </td>

                <td>
                    ${data.percentage}%
                </td>

                <td>

                    <span
                        class="badge ${risk.class}"
                    >
                        ${risk.label}
                    </span>

                </td>

                <td>

                    ${
                        data.percentage < 75 &&
                        data.total > 0

                        ? `

                            <button
                                class="secondary-btn"
                                onclick="openRecoveryForStudent('${student.id}')"
                            >
                                Recovery
                            </button>

                          `

                        : `

                            <span
                                class="badge safe"
                            >
                                On Track
                            </span>

                          `
                    }

                </td>

            `;


            tbody.appendChild(
                row
            );

        }
    );


    const safeCount =
        document.getElementById(
            "safeCount"
        );


    if (safeCount) {

        safeCount.textContent =
            safe;

    }


    const warningCount =
        document.getElementById(
            "warningCount"
        );


    if (warningCount) {

        warningCount.textContent =
            warning;

    }


    const criticalCount =
        document.getElementById(
            "criticalCount"
        );


    if (criticalCount) {

        criticalCount.textContent =
            critical;

    }

}


function openRecoveryForStudent(
    id
) {

    const data =
        getStudentAttendance(
            id
        );


    document.getElementById(
        "recoveryTotal"
    ).value =
        data.total;


    document.getElementById(
        "recoveryAttended"
    ).value =
        data.present +
        data.late;


    document.getElementById(
        "recoveryTarget"
    ).value =
        attendanceGoal;


    showPage(
        "recovery"
    );


    calculateRecovery();

}


/* =====================================================
   ANALYTICS
===================================================== */

function renderAnalytics() {

    const stats =
        getAllAttendanceStats();


    const total =
        stats.total;


    const presentPercentage =
        total === 0
            ? 0
            :
            stats.present /
            total *
            100;


    const absentPercentage =
        total === 0
            ? 0
            :
            stats.absent /
            total *
            100;


    const latePercentage =
        total === 0
            ? 0
            :
            stats.late /
            total *
            100;


    const chartPresent =
        document.getElementById(
            "chartPresent"
        );


    if (chartPresent) {

        chartPresent.style.width =
            presentPercentage + "%";

    }


    const chartAbsent =
        document.getElementById(
            "chartAbsent"
        );


    if (chartAbsent) {

        chartAbsent.style.width =
            absentPercentage + "%";

    }


    const chartLate =
        document.getElementById(
            "chartLate"
        );


    if (chartLate) {

        chartLate.style.width =
            latePercentage + "%";

    }


    const chartPresentValue =
        document.getElementById(
            "chartPresentValue"
        );


    if (chartPresentValue) {

        chartPresentValue.textContent =
            presentPercentage.toFixed(1) +
            "%";

    }


    const chartAbsentValue =
        document.getElementById(
            "chartAbsentValue"
        );


    if (chartAbsentValue) {

        chartAbsentValue.textContent =
            absentPercentage.toFixed(1) +
            "%";

    }


    const chartLateValue =
        document.getElementById(
            "chartLateValue"
        );


    if (chartLateValue) {

        chartLateValue.textContent =
            latePercentage.toFixed(1) +
            "%";

    }


    renderDepartmentAnalytics();

    renderStudentAnalytics();

}


function renderDepartmentAnalytics() {

    const container =
        document.getElementById(
            "departmentAnalytics"
        );


    if (!container) return;


    const departments =
        [
            ...new Set(
                students.map(
                    student =>
                        student.department
                )
            )
        ];


    container.innerHTML = "";


    departments.forEach(
        department => {

            const deptStudents =
                students.filter(
                    student =>
                        student.department ===
                        department
                );


            let total = 0;
            let attended = 0;


            deptStudents.forEach(
                student => {

                    const data =
                        getStudentAttendance(
                            student.id
                        );


                    total +=
                        data.total;


                    attended +=
                        data.present +
                        data.late;

                }
            );


            const percentage =
                total === 0
                    ? 0
                    :
                    attended /
                    total *
                    100;


            const row =
                document.createElement(
                    "div"
                );


            row.className =
                "department-row";


            row.innerHTML = `

                <div
                    class="department-info"
                >

                    <span>
                        ${escapeHTML(
                            department
                        )}
                    </span>

                    <strong>
                        ${percentage.toFixed(1)}%
                    </strong>

                </div>


                <div
                    class="progress-bar"
                >

                    <div
                        style="
                            width:${percentage}%;
                        "
                    ></div>

                </div>

            `;


            container.appendChild(
                row
            );

        }
    );


    if (
        !departments.length
    ) {

        container.innerHTML =
            "<p>No department data.</p>";

    }

}


function renderStudentAnalytics() {

    const container =
        document.getElementById(
            "studentAnalytics"
        );


    if (!container) return;


    container.innerHTML = "";


    students.forEach(
        student => {

            const data =
                getStudentAttendance(
                    student.id
                );


            const row =
                document.createElement(
                    "div"
                );


            row.className =
                "student-performance-row";


            row.innerHTML = `

                <div
                    class="student-performance-info"
                >

                    <span>
                        ${escapeHTML(
                            student.name
                        )}
                    </span>

                    <strong>
                        ${data.percentage}%
                    </strong>

                </div>


                <div
                    class="progress-bar"
                >

                    <div
                        style="
                            width:${data.percentage}%;
                        "
                    ></div>

                </div>

            `;


            container.appendChild(
                row
            );

        }
    );

}


/* =====================================================
   CSV EXPORT
===================================================== */

function exportCSV() {

    let csv =
        "Date,Subject,Roll Number,Student,Department,Status\n";


    Object.keys(attendance)
        .forEach(
            key => {

                const parts =
                    key.split("__");


                const date =
                    parts[0];


                const subject =
                    parts
                        .slice(1)
                        .join("__");


                const records =
                    attendance[key];


                Object.keys(records)
                    .forEach(
                        studentId => {

                            const student =
                                students.find(
                                    s =>
                                        s.id ===
                                        studentId
                                );


                            if (!student)
                                return;


                            const status =
                                records[
                                    studentId
                                ];


                            csv +=
                                `"${date}",` +
                                `"${subject}",` +
                                `"${student.roll}",` +
                                `"${student.name}",` +
                                `"${student.department}",` +
                                `"${status}"\n`;

                        }
                    );

            }
        );


    const blob =
        new Blob(
            [csv],
            {
                type:
                    "text/csv;charset=utf-8;"
            }
        );


    const url =
        URL.createObjectURL(
            blob
        );


    const link =
        document.createElement(
            "a"
        );


    link.href =
        url;


    link.download =
        `SMARTATTEND_Attendance_${getToday()}.csv`;


    document.body.appendChild(
        link
    );


    link.click();


    document.body.removeChild(
        link
    );


    URL.revokeObjectURL(
        url
    );

}


/* =====================================================
   SETTINGS
===================================================== */

function setupSettings() {

    const darkButton =
        document.getElementById(
            "settingsDarkBtn"
        );


    if (darkButton) {

        darkButton.addEventListener(
            "click",
            toggleDarkMode
        );

    }


    const exportButton =
        document.getElementById(
            "settingsExportBtn"
        );


    if (exportButton) {

        exportButton.addEventListener(
            "click",
            exportCSV
        );

    }


    const resetButton =
        document.getElementById(
            "resetDataBtn"
        );


    if (resetButton) {

        resetButton.addEventListener(
            "click",
            resetDemoData
        );

    }


    const clearButton =
        document.getElementById(
            "clearDataBtn"
        );


    if (clearButton) {

        clearButton.addEventListener(
            "click",
            clearAllData
        );

    }


    const analyticsRefresh =
        document.getElementById(
            "analyticsRefresh"
        );


    if (analyticsRefresh) {

        analyticsRefresh.addEventListener(
            "click",
            renderAnalytics
        );

    }

}


/* =====================================================
   RESET DATA
===================================================== */

async function resetDemoData() {

    alert(
        "Demo data reset is disabled because students are now stored in MongoDB.\n\n" +
        "Please add or delete students through the Students page."
    );

}


/* =====================================================
   CLEAR DATA
===================================================== */

async function clearAllData() {

    const answer =
        confirm(
            "Are you sure you want to delete ALL students from MongoDB?"
        );


    if (!answer) return;


    try {

        for (
            const student of students
        ) {

            await apiRequest(
                `${API_URL}/students/${student.id}`,
                {
                    method: "DELETE"
                }
            );

        }


        students = [];

        attendance = {};

        saveData();

        renderAll();


        alert(
            "All students have been deleted from MongoDB."
        );

    }

    catch (error) {

        console.error(
            "CLEAR DATA ERROR:",
            error
        );


        alert(
            "Some students could not be deleted.\n\n" +
            error.message
        );


        await loadStudentsFromBackend();

    }

}


/* =====================================================
   DARK MODE
===================================================== */

function setupDarkMode() {

    const saved =
        localStorage.getItem(
            DARK_KEY
        );


    if (
        saved === "true"
    ) {

        document.body.classList.add(
            "dark"
        );

    }


    updateDarkIcon();


    const darkButton =
        document.getElementById(
            "darkModeBtn"
        );


    if (darkButton) {

        darkButton.addEventListener(
            "click",
            toggleDarkMode
        );

    }

}


function toggleDarkMode() {

    document.body.classList.toggle(
        "dark"
    );


    const enabled =
        document.body.classList.contains(
            "dark"
        );


    localStorage.setItem(
        DARK_KEY,
        enabled
    );


    updateDarkIcon();

}


function updateDarkIcon() {

    const icon =
        document.getElementById(
            "darkIcon"
        );


    if (!icon) return;


    if (
        document.body.classList.contains(
            "dark"
        )
    ) {

        icon.textContent =
            "☀";

    }

    else {

        icon.textContent =
            "☾";

    }

}


/* =====================================================
   MOBILE MENU
===================================================== */

function setupMobileMenu() {

    const menuButton =
        document.getElementById(
            "menuBtn"
        );


    if (menuButton) {

        menuButton.addEventListener(
            "click",
            () => {

                const sidebar =
                    document.getElementById(
                        "sidebar"
                    );

                const overlay =
                    document.getElementById(
                        "mobileOverlay"
                    );


                if (sidebar) {

                    sidebar.classList.add(
                        "mobile-open"
                    );

                }


                if (overlay) {

                    overlay.classList.add(
                        "show"
                    );

                }

            }
        );

    }


    const overlay =
        document.getElementById(
            "mobileOverlay"
        );


    if (overlay) {

        overlay.addEventListener(
            "click",
            closeMobileMenu
        );

    }

}


function closeMobileMenu() {

    const sidebar =
        document.getElementById(
            "sidebar"
        );


    const overlay =
        document.getElementById(
            "mobileOverlay"
        );


    if (sidebar) {

        sidebar.classList.remove(
            "mobile-open"
        );

    }


    if (overlay) {

        overlay.classList.remove(
            "show"
        );

    }

}


/* =====================================================
   RENDER EVERYTHING
===================================================== */

function renderAll() {

    updateDashboard();

    renderStudents();

    renderAttendance();

    renderSmartInsights();

    renderRiskMonitor();

    renderAnalytics();

    renderGoal();

    updateDepartmentFilters();

    generateAttendanceNotifications();

}


/* =====================================================
   HTML SAFETY
===================================================== */

function escapeHTML(value) {

    return String(value)

        .replace(
            /&/g,
            "&amp;"
        )

        .replace(
            /</g,
            "&lt;"
        )

        .replace(
            />/g,
            "&gt;"
        )

        .replace(
            /"/g,
            "&quot;"
        )

        .replace(
            /'/g,
            "&#039;"
        );

}


/* =====================================================
   MODAL OUTSIDE CLICK
===================================================== */

document.addEventListener(
    "click",
    event => {

        const modal =
            document.getElementById(
                "studentModal"
            );


        if (
            modal &&
            event.target === modal
        ) {

            closeStudentModal();

        }

    }
); 
// =========================================
// NOTIFICATION PANEL
// =========================================

const notificationBtn =
    document.getElementById("notificationBtn");

const notificationPanel =
    document.getElementById("notificationPanel");

const closeNotifications =
    document.getElementById("closeNotifications");

if (notificationBtn) {

    notificationBtn.addEventListener("click", () => {

        if (notificationPanel) {

            notificationPanel.classList.toggle("show");

        }

    });

}

if (closeNotifications) {

    closeNotifications.addEventListener("click", () => {

        if (notificationPanel) {

            notificationPanel.classList.remove("show");

        }

    });

}


// =========================================
// LOAD SAVED NOTIFICATIONS
// =========================================

function loadNotifications() {

    const notificationList =
        document.getElementById("notificationList");

    const notificationBadge =
        document.getElementById("notificationBadge");

    if (!notificationList) return;

    const savedNotifications =
        JSON.parse(
            localStorage.getItem(
                "smartattend_notifications"
            )
        ) || [];

    notificationList.innerHTML = "";

    savedNotifications.forEach(notification => {

        const item =
            document.createElement("div");

        item.className =
            "notification-item";

        item.innerHTML = `
            <strong>
                ${escapeHTML(notification.title)}
            </strong>

            <p>
                ${escapeHTML(notification.message)}
            </p>
        `;

        notificationList.appendChild(item);

    });

    if (notificationBadge) {

        notificationBadge.textContent =
            savedNotifications.length;

    }

}


// =========================================
// AUTOMATIC ATTENDANCE NOTIFICATIONS
// =========================================

function generateAttendanceNotifications() {

    const notificationList =
        document.getElementById("notificationList");

    const notificationBadge =
        document.getElementById("notificationBadge");

    if (!notificationList) return;


    // Create notification array
    const notifications = [];


    // Check every student
    students.forEach(student => {

        const data =
            getStudentAttendance(student.id);


        // Ignore students without attendance
        if (data.total === 0) return;


        // =====================================
        // CRITICAL ATTENDANCE
        // =====================================

        if (data.percentage < 60) {

            notifications.push({

                title:
                    "🔴 Critical Attendance",

                message:
                    `${student.name}'s attendance is ${data.percentage}%. Immediate attention is required.`

            });

        }


        // =====================================
        // WARNING ATTENDANCE
        // =====================================

        else if (
            data.percentage < attendanceGoal
        ) {

            notifications.push({

                title:
                    "🟠 Attendance Warning",

                message:
                    `${student.name}'s attendance is ${data.percentage}%. The student is below the ${attendanceGoal}% target.`

            });

        }


        // =====================================
        // SAFE ATTENDANCE
        // =====================================

        else {

            notifications.push({

                title:
                    "🟢 Attendance On Track",

                message:
                    `${student.name}'s attendance is ${data.percentage}%. The student is meeting the attendance goal.`

            });

        }

    });


    // =====================================
    // SAVE NOTIFICATIONS
    // =====================================

    localStorage.setItem(

        "smartattend_notifications",

        JSON.stringify(notifications)

    );


    // =====================================
    // DISPLAY NOTIFICATIONS
    // =====================================

    notificationList.innerHTML = "";


    notifications.forEach(notification => {

        const item =
            document.createElement("div");

        item.className =
            "notification-item";

        item.innerHTML = `

            <strong>
                ${escapeHTML(
                    notification.title
                )}
            </strong>

            <p>
                ${escapeHTML(
                    notification.message
                )}
            </p>

        `;

        notificationList.appendChild(item);

    });


    // =====================================
    // UPDATE NOTIFICATION BADGE
    // =====================================

    if (notificationBadge) {

        notificationBadge.textContent =
            notifications.length;

    }

}