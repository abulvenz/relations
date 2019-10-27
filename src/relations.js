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

export function collection(data, {
    idField = 'id',
    required = [],
    optional = [],
}) {
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
    const propertyOf = property => element => element[property];
    const propertyEquals = (property, value) => use(propertyOf(property), prop => prop(element) === value);
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
                    data.push(element);
                    return idOf(element);
                }
            );

    const relations = {};

    const handler = {
        apply: function (obj, thisArg, args) {
          //  console.log(obj, prop, value)
            return (obj[prop]
                && Reflect.apply(obj[prop], obj, args))
                || (relations[prop]
                    && Reflect.apply(relations[prop].resolve, obj, args));
        },
        get: function (target, prop, receiver) {
          //  console.log(target, prop, receiver)
            if (prop in relations) {
                return relations[prop].resolve(target);
            } else {
                return Reflect.get(...arguments);
            }
        },
        set: function (target, prop, value) {
         //   console.log(target, prop, value);
            relations[prop].establish(target, value);
            return true;
        }
    };

    const proxyObject = obj => {
       // console.log(obj)
        return obj && new Proxy(obj, handler);
    }

    const get = id => proxyObject(use(filterBy(id), result => first(result)));

    const addRelation = (name, type, collection) => {
        if (!!relations[name])
            fail(`Relation was already defined: ${name}`);
        relations[name] = relation(name, collection);
     //   console.log(relations)
    };

    return {
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
        which: relations
    };
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
        resolve: (obj, key) => exec(() => null/*console.log('obj', obj, obj[name], collection)
        */, () => collection.get(obj[name])),
        establish: (obj, value) => obj[name] = value,
    };
};