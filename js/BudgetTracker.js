export default class BudgetTracker {
    constructor(querySelectorString){
        this.root =  document.querySelector(querySelectorString);
        this.root.innerHTML = BudgetTracker.html();

        this.root.querySelector(".new-entry").addEventListener("click", () => {
            this.onNewEntryBtnClick();
        });
        // console.log(this.root);
        this.load();
    }

    static html(){
        //Returns the html for the actual table itself...
        return `
            <table class="budget-tracker">
                <thead>
                    <tr>
                        <th>Date</th>
                        <th>Description</th>
                        <th>Type</th>
                        <th>Amount</th>
                    </tr>
                </thead>
                <tbody class="entries"></tbody>
                <tbody>
                    <tr>
                        <td colspan="5" class="controls">
                            <button type="button" class="new-entry">New Entry</button>
                        </td>
                    </tr>
                </tbody>
                <tfoot>
                    <tr>
                        <td colspan="5" class="summary">
                            <strong>Total:</strong>
                            <span class="total">$0.00</span>
                        </td>
                    </tr>
                </tfoot>
            </table>
        `;
    }

    static entryHtml(){
        //Returns the html string for a single row inside that table..
        return `
            <tr>
                <td>
                    <input class="input input-date" type="date">
                </td>
                <td>
                    <input class="input input-description" type="text" placeholder="Add a Descripton(e.g. wages, bills, etc.)">
                </td>
                <td>
                    <select class="input input-type">
                        <option value="income">Income</option>
                        <option value="Expense">Expense</option>
                    </select>
                </td>
                <td>
                    <input class="input input-amount" type="number">
                </td> 
                <td>
                    <button type="button" class="delete-entry">&#10005;</button>
                </td> 
            </tr>
        `;
    }

    load(){
        //Initial loading of the data...
        const entries = JSON.parse(localStorage.getItem("budget-tracker-entries") || "[] ");

        for (const entry of entries){
            this.addEntry(entry);
        }
        
        this.updateSummary();
    }

    updateSummary(){
        //take all of the current rows in the table and work out the total amount
        // and dispaly in the bottom right hand corner
        const total = this.getEntryRows().reduce((total, row) => {
            const amount = row.querySelector(".input-amount").value;
            const isExpense = row.querySelector('.input-type').value === "Expense";
            const modifier = isExpense ? -1: 1;

            return total + (amount * modifier);
        }, 0);  

        // console.log(total);
        const totalFormatted = new Intl.NumberFormat("en-US", {
            style: "currency",
            currency: "USD"
        }).format(total);

        this.root.querySelector(".total").textContent = totalFormatted;
    }

    save(){
         //takes all the data and saves it LocalStorage 
         //so it can be persisted when you refresh the page...
        const data = this.getEntryRows().map(row => {
            return{
                date: row.querySelector('.input-date').value,
                description: row.querySelector('.input-description').value,
                type: row.querySelector(".input-type").value,
                amount: parseFloat(row.querySelector(".input-amount").value),
            };
        });

        localStorage.setItem("budget-tracker-entries", JSON.stringify(data));
        this.updateSummary();
    }

    addEntry(entry = {}){
        //add a new entry to the table...
        this.root.querySelector('.entries').insertAdjacentHTML("beforeend", BudgetTracker.entryHtml());
         
        const row = this.root.querySelector(".entries tr:last-of-type");

        
        row.querySelector(".input-date").value = entry.date || new Date().toISOString( ).replace(/T.*/, "");
        row.querySelector(".input-description").value = entry.description || "";
        row.querySelector(".input-type").value = entry.type || "income";
        row.querySelector(".input-amount").value = entry.amount || 0;
        row.querySelector(".delete-entry").addEventListener("click", e => {
            this.onDeleteEntryBtnClick(e);
        });

        row.querySelectorAll('.input').forEach(input => {
            input.addEventListener("change", () => this.save());          
        });
    }

    getEntryRows(){
        //is a helper method that will help us 
        // get all of the active rows or all rows in a table...
        return Array.from(this.root.querySelectorAll(".entries tr"));
    }

    onNewEntryBtnClick(){
        //active when you click on the button for new entry...
        this.addEntry();  
    }

    onDeleteEntryBtnClick(e){
        //active when the user clicks on the delete entry...
        e.target.closest("tr").remove();
        this.save();
    }    
}