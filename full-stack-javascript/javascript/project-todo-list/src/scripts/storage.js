import { ToDo } from './obj/ToDo.js';
import { Project } from './obj/Project.js';

/**
 * 
 * @param {ToDo | Project} objToSave 
 * @throws LocalStorageError if localStorage not accessible, or ParameterError if parameter is not a ToDo or Project object.
 */
function save(objToSave) {

    if (!localStorageAvailable()) throw new LocalStorageError('save', 'Local storage is not available! - save action not complete');
    if (objToSave instanceof ToDo) saveToDo(objToSave);
    else if (objToSave instanceof Project) saveProject(objToSave);
    else throw new ParameterError('objToSave', 'parameter must be a ToDo object or a Project object but was not');

    function saveToDo(toDoObj) {
        let todosFromStorage;
        try {
            // attempt to load todos object from localStorage
            todosFromStorage = JSON.parse(getStorage().todos);
        } catch (err) {
            // if parse fails then set to empty object
            todosFromStorage = {};
        }
        // set key of todo uid to stringified ToDo object
        todosFromStorage[toDoObj.uid] = toDoObj;
        // save data in localStorage
        getStorage().setItem('todos', JSON.stringify(todosFromStorage));
        console.log(`Todo saved: [uid: ${toDoObj.uid}] [title: ${toDoObj.title}]`);
    }
    function saveProject(projectObj) {
        let projectsFromStorage;
        try {
            // attempt to load todos object from localStorage
            projectsFromStorage = JSON.parse(getStorage().projects);
        } catch (err) {
            // if parse fails then set to empty object
            projectsFromStorage = {};
        }
        // save all ToDos in project sequentially
        for (let todo of projectObj.todos) {
            saveToDo(todo);
        }
        // set key of project uid to stringified Project object
        projectsFromStorage[projectObj.uid] = JSON.stringify(projectObj);
        // save data in storage
        getStorage().setItem('projects', JSON.stringify(projectsFromStorage));
        console.log(`Project saved: [uid: ${projectObj.uid}] [title: ${projectObj.title}]`);
    }
}

/**
 * Multi-use
 * @param {string} toLoad "todo" or "project"
 * @param {number} uid uid of ToDo or Project object
 * @return single instance of ToDo or Project if uid is specifed, ToDo[] or Project[] (all stored) if not. Returns null if specific project is not found.
 * @throws LocalStorageError if local storage not accessible, or ParameterError if toLoad string was not recognised as valid.
 */
function load(toLoad, uid = null) {

    if (!localStorageAvailable()) throw new LocalStorageError('load', 'Local storage is not available! - load action not complete');
    if (toLoad !== 'project' && toLoad !== 'todo') throw new ParameterError('toLoad', `invalid paramter, must be "todo" or "project" but was "${toLoad}"`);


    if (toLoad === 'todo') {
        if (uid === null) return loadToDos();
        return loadTodo(uid);
    }
    if (toLoad === 'project') {
        if (uid === null) return loadProjects();
        return loadProject(uid);
    }

    function loadProject(projectUid) {
        if (typeof projectUid !== 'number') {
            throw new Error('loadProject(projectUid) projectUID parameter must be a number');
        }
        let loadedProjects = JSON.parse(getStorage().getItem('projects'));
        if (!loadedProjects.hasOwnProperty(projectUid)) {
            return null; // return null if project with projectUid not found
        }
        let parsedObj = JSON.parse(loadedProjects[projectUid]);
        let projectObj = new Project(parsedObj.title, parsedObj.description, parsedObj.notes, projectUid);
        for (let tuid of parsedObj.toDoUids) {
            let t = load('todo', tuid);
            //console.log(t);
            projectObj.addTodo(t);
        }
        return projectObj;
    }
    function loadProjects() {
        let loadedProjects = JSON.parse(getStorage().getItem('projects'));
        let projectObjs = [];
        for (let projectUID in loadedProjects) {
            let parsedObj = JSON.parse(loadedProjects[projectUID]);
            let projectObj = new Project(parsedObj.title, parsedObj.description, parsedObj.notes, parseInt(projectUID));
            for (let tuid of parsedObj.toDoUids) {
                projectObj.addTodo(loadTodo(tuid));
            }
            projectObjs.push(projectObj);
        }

        console.groupCollapsed('Projects loaded')
        console.log(`Projects loaded [number loaded: ${projectObjs.length}]`);
        for (let project of projectObjs) {
            console.log(project);
        }
        console.groupEnd('Projects loaded')

        return projectObjs;
    }
    function loadTodo(toDoUid) {
        //console.log("attempting to load todo with uid: " + toDoUid);

        let loadedTodosAll = getStorage().getItem('todos');
        //console.log(loadedTodosAll);

        let loadedTodo = JSON.parse(loadedTodosAll)[toDoUid];

        // let obj = JSON.parse(JSON.parse(loadedTodosAll)[toDoUid]);
        // //console.log(obj);

        let todo = new ToDo(loadedTodo.title, loadedTodo.description, new Date(loadedTodo.dueDate), loadedTodo.priority, loadedTodo.uid);
        todo.notes = loadedTodo.notes;

        for (let item of loadedTodo.checklist) {
            todo.addToCheckList(item[0], item[1]);
            //console.log(item);
        }

        //console.log(todo.toString());

        return todo;


    }
    function loadToDos() {
        let loadedTodosJson = getStorage().getItem('todos');
        //console.log(loadedTodosJson);

        let parsedTodos = JSON.parse(loadedTodosJson);
        //console.log(parsedTodos);

        let builtTodos = [];
        for (let tuid in parsedTodos) {
            //console.log(typeof keyUid);
            // let obj = parsedTodos[keyUid];
            // //console.log(u);
            // let todo = new ToDo(obj.title, obj.description, new Date(obj.dueDate), obj.priority, obj.uid);
            // for (let item of obj.checklist) {
            //     todo.addToCheckList(item[0], item[1]);
            // }
            //console.log(todo);
            builtTodos.push(loadTodo(tuid));
        }
        //console.log(builtTodos);
        console.groupCollapsed('ToDos loaded')
        console.log(`ToDos loaded [number loaded: ${builtTodos.length}]`);
        for (let todo of builtTodos) {
            console.log(todo);
        }
        console.groupEnd('ToDos loaded')
        return builtTodos;
    }
}

/**
 * Checks if localStorage is accessible.
 * @returns a boolean representing if localStorage is accessible.
 */
function localStorageAvailable() {
    var storage;
    try {
        storage = getStorage();
        var x = '__storage_test__';
        storage.setItem(x, x);
        storage.removeItem(x);
        return true;
    }
    catch (e) {
        return false;
    }
}

/**
 * Retrieve json from storage source - currently localStorage
 * @returns a Storage object (array-like object of key:value pairs)
 */
function getStorage() {
    return window['localStorage'];
}

/**
 * Clear localStorage
 */
function clearStorage() {
    console.log('localStorage cleared!')
    getStorage().clear();
}

/**
 * Print to console all ToDo objects in localStorage
 */
function displayStorage() {
    // console.group('displaying storage');
    // let s = Array.from(loadToDos()) || [];
    // for (let i = 0; i < s.length; i++) {
    //     console.log(s[i]);
    // }
    // console.groupEnd('displaying storage');
}

class LocalStorageError extends Error {
    constructor(action, message) {
        super(`${action} : ${message}`);
        this.name = 'LocalStorageError';
    }
}

class ParameterError extends Error {
    constructor(parameterName, message) {
        super(`${parameterName} : ${message}`);
        this.name = `ParameterError`;
    }
}

export { clearStorage, displayStorage, save, load, LocalStorageError, ParameterError };