// jshint esversion: 6
const use = (v, f) => f(v);
const pushed = (array, element) => {
    array.push(element);
    return array;
};
const isEmpty = array => array && array.length === 0;
const optionallyApply = (condition, conditionally, compulsory) => condition ? (() => { conditionally(); compulsory() })() : compulsory();
const fail = msg => { throw new Error(msg) };
const last = arr => arr && arr.length > 0 ? arr[arr.length - 1] : undefined;
const first = arr => arr && arr.length > 0 ? arr[0] : undefined;
const exec = (...args) => last(args.map(arg => arg()));

const debug = (name, fn) => args => {
    console.log(args)
    const result = fn(args);
    console.log('calling ' + name, args, result);
    return result;
};

const uuid = (() => {
    let t = new Date().getTime();
    let n = 0;
    return {
        create: () => use(
            new Date().getTime(),
            nt => nt === t ?
                t + '.' + (++n) :
                exec(() => t = nt, () => n = 0, () => t + '.0')
        )
    };
})();

const getProp = (path, obj) => {
    if (!obj) return obj;

    const frags = path.split('.');

    if (frags.length === 1)
        console.log('Fraggles', obj, path)

    obj = obj[frags.splice(0, 1)];
    if (frags.length > 0) {
        return getProp(frags.join('.'), obj);
    }
    console.log('eat this', obj)

    return obj;
}


const a = {
    b: {
        name: 'Hellou'
    }
}

console.log(getProp('b.name', a))
console.log(getProp('name', a.b))




export function collection(data_, {
    idField = 'id',
    required = [],
    optional = [],
}) {

    const thisObject = {};

    const handler = {
        apply: function (obj) {
            console.log('apply', obj())
            return obj()
        },
        get: function (target, prop, receiver) {
            //   
            if (prop in relations) {
                console.log('ggg', relations, prop, relations[prop])
                return relations[prop].resolve(target());
            } else {
                console.log('get', target(), prop, receiver)
                return Reflect.get(target(), prop, receiver);
            }
        },
        set: function (target, prop, value) {
            //   console.log(target, prop, value);
            relations[prop].establish(target(), value);
            return true;
        },
        ownKeys: (target)=>Object.keys(target())
    };

    const proxyObject = obj =>
        obj && new Proxy(() => obj, handler);

    const data = data_.map(proxyObject);

    // Array functions
    const find = fn => data.find(fn);
    const map = fn => data.map(fn);
    const filter = fn => data.filter(fn);
    const some = fn => data.some(fn);
    const every = fn => data.every(fn);
    const reduce = args => data.reduce(...args);

    // Id functions
    const idOf = element => element[idField];
    const idEquals = id => element => idOf(element) === id;
    const propertyOf = property => element => getProp(property, element);// element[property];

    const propertyEquals = (property, value) => element =>
        use(propertyOf(property), prop => {
            console.log('deep inside: ', property, element,value)
            return prop(element) === value;
        })

    const hasId = element => !!idOf(element);
    const hasProperty = property => element => property in element;

    // Collection functions
    const filterBy = id => filter(idEquals(id));
    const filterByProperty = (property, value) => filter(propertyEquals(property, value));
    const pluck = property => map(propertyOf(property));
    const contains = id => !isEmpty(filterBy(id));

    const add = element =>
        hasId(element) &&
            contains(idOf(element))
            ? fail(`ID already exists: ${idOf(element)}`)
            : optionallyApply(
                !hasId(element),
                () => element[idField] = uuid.create(),
                () => {
                    data_.push(element);
                    data.push(proxyObject(element));
                    return idOf(element);
                }
            );

    const relations = {};

    const get = id => use(filterBy(id), result => first(result));

    const addRelation = (name, type, collection, foreignKey) => {
        if (!!relations[name])
            fail(`Relation was already defined: ${name}`);
        if (type === relationTypes.ONE_TO_ONE)
            relations[name] = relation(name, collection);
        else if (type === relationTypes.ZERO_TO_N)
            relations[name] = relation_ZERO_TO_N(foreignKey, collection);
        else if (type === relationTypes.ONE_TO_N)
            relations[name] = relation(name, collection);
        else if (type === relationTypes.N_TO_M)
            relations[name] = relation(name, collection);
        //   console.log(relations)
    };

    return Object.assign(thisObject, {
        get,
        add,
        find,
        map,
        filter,
        some,
        every,
        reduce,
        idOf,
        idEquals,
        filterBy,
        filterByProperty,
        pluck,
        addRelation,
        data,
        data_,
        which: relations
    });
}

export default {
    use,
    fail,
    first,
    last,
    isEmpty,
    exec,
    debug,
};

export const relationTypes = {
    ZERO_TO_N: 'ZERO_TO_N',
    ZERO_TO_ONE: 'ZERO_TO_ONE',
    ONE_TO_ONE: 'ONE_TO_ONE',
    ONE_TO_N: 'ONE_TO_N',
    N_TO_M: 'N_TO_M'
};

export function relation(name, collection) {
    return {
        resolve: (obj, key) => collection.get(obj[name]),
        establish: (obj, value) => obj[name] = value,
    };
};

export function relation_ZERO_TO_N(name, collection) {

    console.log('creating ', name, 'for', collection.data_)

    return {
        resolve: (obj, key) => {
            // wasBornIn Curacao collection=users
            console.log('resolve', name, obj, collection.data_, collection.idOf(obj))
            return collection.filterByProperty(name, collection.idOf(obj));
        },
        establish: (obj, value) => obj[name] = value,
    };
};