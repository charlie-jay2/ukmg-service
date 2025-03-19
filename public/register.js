document.getElementById("registerBtn").addEventListener("click", async () => {
    const userID = document.getElementById("userID").value;
    const name = document.getElementById("name").value;
    const age = document.getElementById("age").value;
    const medicalHistory = document.getElementById("medicalHistory").value;

    const response = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userID, name, age, medicalHistory }),
    });

    const data = await response.json();
    alert(data.message || data.error);
});
