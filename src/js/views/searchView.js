import {elements} from './base';

export const getInput =()=> elements.searchInput.value;

export const clearInput = () => {
    elements.searchInput.value = '';
};

export const clearRes = () => {
    elements.searchResList.innerHTML = '';
    elements.searchResPages.innerHTML = '';
};

//選擇後背景變灰色的    
export const selected = id => {

    const resArr = Array.from(document.querySelectorAll('.results__link'))
    resArr.forEach(el => {
        el.classList.remove('results__link--active');
    })
    document.querySelector(`.results__link[href="#${id}"]`).classList.add('results__link--active');
}

/* 
Pasta with tomatos and spinach

acc:0 / acc + cur.length = 5 / newTitle = ['Pasta']
acc:5 / acc + cur.length = 9 / newTitle = ['Pasta', 'with']
acc:9 / acc + cur.length = 15 / newTitle = ['Pasta', 'with', 'tomatos']
acc:15 / acc + cur.length = 18 / newTitle = ['Pasta', 'with', 'tomatos']
...
*/
//超過17個英文字母會變成...
export const limitRecipeTitle = (title, limit = 17) => {
    const newTitle = [];
    if (title.length > limit) {
        title.split(' ').reduce((acc,cur)=> {
            if (acc + cur.length <= limit) {
                newTitle.push(cur);
            }
            return acc + cur.length;
        },0);

        return `${newTitle.join(' ')} ...`;
    } 

    return title;
}

//顯示出左邊list
const renderRecipe = recipe => {
    const markup =`
        <li>
            <a class="results__link" href="#${recipe.recipe_id}">
                 <figure class="results__fig">
                    <img src="${recipe.image_url}" alt="${recipe.title}">
                </figure>
                <div class="results__data">
                    <h4 class="results__name">${limitRecipeTitle(recipe.title)}</h4>
                    <p class="results__author">${recipe.publisher}</p>
                </div>
            </a>
        </li>
    `;

    elements.searchResList.insertAdjacentHTML('beforeend', markup);
};

//type: prev / next
const createBtn = (page, type) => `
    <button class="btn-inline results__btn--${type}" data-goto=${type === 'prev' ? page-1 : page+1}>
        <span>Page ${type === 'prev' ? page-1 : page+1}</span>
        <svg class="search__icon">
            <use href="img/icons.svg#icon-triangle-${type === 'prev' ? 'left' : 'right'}"></use>
        </svg>
    </button>
`


//頁數按鈕
const renderBtn = (page, numRes, resPerPage) => {
    //ceil 無條件進位
    const pages = Math.ceil(numRes / resPerPage);

    let btn;

    if (page === 1 & pages > 1) {
        //Btn to next page
        btn = createBtn(page, 'next');
    } else if (page < pages) {
        //Btn both
        btn = `
        ${createBtn(page, 'next')}
        ${createBtn(page, 'prev')}
        `
        ;
    } else if (page === pages) {
        //Btn to prev page
        btn = createBtn(page, 'prev');
    }

    elements.searchResPages.insertAdjacentHTML('afterbegin', btn);
};


export const renderResults = (recipes, page = 1,  resPerPage = 10)=> {
    //一頁顯示10個結果

    const start = (page - 1) * resPerPage ;
    const end = page * resPerPage;

    recipes.slice(start, end).forEach(renderRecipe);

    //call 顯示按鈕
    
    renderBtn(page, recipes.length, resPerPage);
};