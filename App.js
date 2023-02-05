const heightInput = document.getElementById("height");
const weightInput = document.getElementById("weight");
const ageInput = document.getElementById("age");
const genderInput = document.getElementById("gender");
const activityLevelInput = document.getElementById("activity-level");

const generateMealsButton = document.getElementById("generate-meals-btn");
const mealsContener = document.getElementById('meals');
const recipeContener = document.getElementById("recipe");
const recipeList = document.getElementById("recipeList");

let mealRecipe1;
let mealRecipe2;
let mealRecipe3;

generateMealsButton.addEventListener('click', (e)=>{
    e.preventDefault();

    mealsContener.innerHTML = "";
    if(!recipeContener.classList.contains("display")){
        recipeContener.classList.add("display");
    }

    mealRecipe1 = "";
    mealRecipe2 = "";
    mealRecipe3 = "";

    const height = heightInput.value;
    const weight = weightInput.value;
    const age = ageInput.value;
    const gender = genderInput.value;
    const activityLevel = activityLevelInput.value;
    if(height && weight && age && gender && activityLevel){
        let bmr;
        if(gender == "female"){
            bmr = 655.1 + (9.563 * Number(weight)) + (1.850 * Number(height)) - (4.676 * Number(age));
        }
        else{
            bmr = 66.47 + (13.75 * Number(weight)) + (5.003 * Number(height)) - (6.755 * Number(age));
        }
        bmr = bmr * Number(activityLevel);

        
        try{
            async function runApis(){
                const allMeals = await fetch(`https://api.spoonacular.com/mealplanner/generate?apiKey=d29b088f527d4769a08a25b565931f0f&timeFrame=day&targetCalories=${bmr}`);
                const mealsObj = await allMeals.json();
                let mealCount = 0;
                mealsObj.meals.forEach((eachMeal)=>{
                    mealCount++;

                    const mealDiv = document.createElement("div");
                    mealDiv.classList.add("meal");

                    const mealTypeHeading = document.createElement("p");
                    mealTypeHeading.classList.add("mealType");
                    mealTypeHeading.textContent = mealType(mealCount);

                    const mealDesDiv = document.createElement("div");
                    mealDesDiv.classList.add("mealDescription");

                    const img = document.createElement("img");
                    img.classList.add("mealImage");
                    img.alt = eachMeal.title;

                    const mealTitle = document.createElement("p");
                    mealTitle.classList.add("mealTitle");
                    mealTitle.textContent = eachMeal.title;

                    const mealCalories = document.createElement("p");
                    mealCalories.classList.add("mealCalories");
                    
                    const button = document.createElement("button");
                    button.textContent = "GET RECIPE";
                    button.classList.add("mealButton");
                    button.id = eachMeal.id;
                    button.setAttribute("onclick", "getRecipe(event)");

                    mealDesDiv.append(img, mealTitle, mealCalories, button);
                    mealDiv.append(mealTypeHeading, mealDesDiv);
                    mealsContener.append(mealDiv);
                
                    fetch(`https://api.spoonacular.com/recipes/${eachMeal.id}/information?apiKey=d29b088f527d4769a08a25b565931f0f`)
                    .then((rel)=> rel.json())
                    .then((recipeObj)=>{
                        img.src = recipeObj.image;
                        mealCalories.textContent = `Calories - ${getCaloriesAmount(recipeObj.summary)}`;
                    })
                    .catch((error)=>{
                        console.log("Somthing error occur in recepie API");
                    })
                })
                
            }
            runApis();
        }
        catch(error){
            console.log("Somthing error occur in Meals API", error);
        }
    }
})

function mealType(mealCount){
    if(mealCount == 1) return "BREAKFAST";
    if(mealCount == 2) return "LUNCH";
    if(mealCount == 3) return "DINNER";
}

function getCaloriesAmount(str){
    let index2 = str.indexOf("calories");
    let index;
    for(let i=index2-2; i>=0; i--){
        if(str.charAt(i) == ">") {
            index = i;
            break;
        }
    }
    let calories = str.slice(index+1, index2-1);
    return calories;
}

function getRecipe(e){
    console.log(e.target.id);

    if(recipeContener.classList.contains("display")){
        recipeContener.classList.remove("display");
    }
    recipeList.innerHTML = "";

    fetch(`https://api.spoonacular.com/recipes/${e.target.id}/information?apiKey=d29b088f527d4769a08a25b565931f0f`)
    .then((rel)=> rel.json())
    .then((recipeDetails)=>{
        console.log(recipeDetails);
        recipeDetails.extendedIngredients.forEach((element)=>{
            const row = document.createElement("tr");
            const ingredients = document.createElement("td");
            ingredients.classList.add("ingredients");
            const equipment = document.createElement("td");

            ingredients.textContent = element.name;
            equipment.textContent = `${element.measures.us.amount} ${element.measures.us.unitLong}`;

            row.append(ingredients, equipment);
            recipeList.append(row);
        })
    })
    .catch((error)=>{
        console.log("Somthing error occur in recipe API");
    })
}