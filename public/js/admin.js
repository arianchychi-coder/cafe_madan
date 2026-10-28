fetch("/admin")
.then(res=>res.json())
.then(data=>{
    const tbody = document.getElementById("table-body")
    tbody.innerHTML = ""
    data.forEach((item,index)=>{
        const row = document.createElement("tr")

        row.innerHTML = `
        <th scope="row">${index + 1}</th>
        <td>${item.name}</td>
         <td>${item.phone}</td>
         <td>${item.role}</td>
        <td>${item.companyname}</td>
        `
        tbody.appendChild(row)
    })
})
.catch(err=>{
    console.log("Error in get fetch: ",err)
})




function exportCSV() {
    const table = document.querySelector(".table-container table");

    if (!table || table.querySelectorAll("tbody tr").length === 0) {
        alert("اطلاعاتی برای خروجی گرفتن وجود ندارد.");
        return;
    }

    const rows = Array.from(table.querySelectorAll("tr"));

    const csvContent = rows.map(row => {
        return Array.from(row.querySelectorAll("th, td"))
            .map(cell => {
                const value = cell.innerText
                    .trim()
                    .replace(/"/g, '""');

                return `"${value}"`;
            })
            .join(",");
    }).join("\r\n");

    // BOM برای نمایش صحیح فارسی در Excel
    const blob = new Blob(
        ["\uFEFF" + csvContent],
        { type: "text/csv;charset=utf-8;" }
    );

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = "festival-participants.csv";

    document.body.appendChild(link);
    link.click();
    link.remove();

    URL.revokeObjectURL(url);
}

function exportPDF() {
    const table = document.querySelector(".table-container table");

    if (!table || table.querySelectorAll("tbody tr").length === 0) {
        alert("اطلاعاتی برای خروجی گرفتن وجود ندارد.");
        return;
    }

    window.print();
}
