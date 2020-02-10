import Search from './models/Search';
import Recipe from './models/Recipe';
import List from './models/List';
import Likes from './models/Likes';
import * as searchView from './views/searchView';
import * as recipeView from './views/recipeView';
import * as listView from './views/listView';
import * as likesView from './views/likesView';
import { elements , renderLoader , clearLoader} from './views/base';

/**Global State
* - search object
* - current recipe object
* - shopping list object
* - liked recipes

*/ 

const state = {};

//SEARCH CONTROLLER

const controlSearch = async() => {
    // 1. get query from view
    const query = searchView.getInput();
    //console.log(query);

    if (query) {
        // 2. new search object and add to state
        state.search = new Search(query);

        // 3. prepare UI for result
        searchView.clearInput();
        searchView.clearRes();
        renderLoader(elements.searchRes);

        try {
            // 4. search for recipe
            await state.search.getResults();

            // 5. render res on UI
            searchView.renderResults(state.search.result);
            clearLoader();
        } catch(err) {
            alert('查無此結果');
            clearLoader();
        }
    }
    
}

elements.searchForm.addEventListener('submit', e => {
    e.preventDefault();
    controlSearch();
});

elements.searchResPages.addEventListener('click', e => {
    const btn = e.target.closest('.btn-inline');
    if (btn) {
        const goToPage = parseInt(btn.dataset.goto, 10);
        searchView.clearRes();
        searchView.renderResults(state.search.result, goToPage);
    }
    
});


/*const search = new Search('pizza');
console.log(search);

search.getResults('pizza');*/


//RECIPE CONTROLLER

const controlRecipe = async() => {
    // Get ID from url
    const id = window.location.hash.replace('#', '');

    if (id) {
        // prepare UI for changes
        recipeView.clearRecipe();
        renderLoader(elements.recipe);

        // highlight selected
        if (state.search) searchView.selected(id);

        // create new recipe object
        state.recipe = new Recipe(id);

        try {
            //get recipe data & parseIng
            await state.recipe.getRecipe();
            state.recipe.parseNewIng();

            //calc servings & time
            state.recipe.calcTime();
            state.recipe.calcServings();

            //render recipe
            clearLoader();
            recipeView.renderRecipe(state.recipe, state.likes.isLiked(id));
        } catch (err) {
            alert('查無此結果');
        }

    }
};

// window.addEventListener('hashchange', controlRecipe);
// window.addEventListener('load', controlRecipe);

['hashchange', 'load'].forEach(event => window.addEventListener(event, controlRecipe));


//LIST CONTROLLER

const controlList = () => {
    //create new list if there is not yet
    if (!state.list) state.list = new List();

    //add ing to list and UI
    
    state.recipe.ingredients.forEach(el => {
        const item = state.list.addItem(el.count, el.unit, el.ingredient);

        listView.renderItem(item);
    });
}

// delete & update list item events
elements.shopping.addEventListener('click', e => {

    const id = e.target.closest('.shopping__item').dataset.itemid;

    //delete BTN
    if (e.target.matches('.shopping__delete, .shopping__delete *')) {
        //delete from state
        state.list.deleteItem(id);

        //delete from UI
        listView.deleteItem(id);

        //count update
    } else if (e.target.matches('.shopping__count-value')) {
        
        const val = parseFloat(e.target.value, 10);
        state.list.updateCount(id, val);
    }
});


//LIKE CONTROLLER
const controlLike = () => {
    if (!state.likes) state.likes = new Likes();

    const curID = state.recipe.id;

    // User NOT yet liked
    if (!state.likes.isLiked(curID)) {
        // add to state
        const newLike = state.likes.addLike(
            curID,
            state.recipe.title,
            state.recipe.author,
            state.recipe.img
        );
        // toggle BTN
        likesView.toggleLikeBtn(true);

        // add to UI list
        likesView.renderLike(newLike);

    } else {
        // User HAS yet liked

        // remove to state
        state.likes.deleteLike(curID);

        // toggle BTN
        likesView.toggleLikeBtn(false);

        // remove from UI list
        likesView.deleteLike(curID);
    }
    likesView.toggleLikeMenu(state.likes.getNumLikes());
}

// Restore liked recipe on page load
window.addEventListener('load', ()=> {
    state.likes = new Likes();

    // restore likes
    state.likes.readStorage();

    // toggle like menu BTN
    likesView.toggleLikeMenu(state.likes.getNumLikes());

    // render the exist liked recipe
    state.likes.likes.forEach(like => likesView.renderLike(like));
});


//recipe BTN click

elements.recipe.addEventListener('click', e => {
    if (e.target.matches('.btn-decrease, .btn-decrease *')) {
        if (state.recipe.servings > 1) {
            //decrease BTN clicked
            state.recipe.updateServings('dec');
            recipeView.updateSerIng(state.recipe);
        }
    } else if (e.target.matches('.btn-increase, .btn-increase *')) {
        //increase BTN clicked
        state.recipe.updateServings('inc');
        recipeView.updateSerIng(state.recipe);
    } else if (e.target.matches('.recipe__btn--add, .recipe__btn--add *')) {
        //add to shoppinglist
        controlList();
    } else if (e.target.matches('.recipe__love', '.recipe__love *')) {
        //like control
        controlLike();
    }
});


