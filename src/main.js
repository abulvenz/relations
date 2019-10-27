// jshint esversion: 6

import m from 'mithril';
import relations, { collection, relation, relationTypes } from './relations';
import { img, li, ul, pre, span, h1, h3 } from './tags';

const S = {
    users: [{
        name:'Helgo',
        wasBornIn:'Land'
    }],
    groups: [],
    locations: [],
    cities: [{name:'Land'}],
};

const M = {
    users: collection(S.users, { idField: 'name' }),
    groups: collection(S.groups, { idField: 'name' }),
    locations: collection(S.locations, { idField: 'name' }),
    cities: collection(S.cities, { idField: 'name' })
};

// Read as: each user was born in exactly one city
M.users.addRelation('wasBornIn', relationTypes.ONE_TO_ONE, M.cities);

// Each city can be the birthplace of 0-N users
M.cities.addRelation('isBirthplaceOf', relationTypes.ZERO_TO_N, M.users, 'wasBornIn.name');

// Each group was created by exactly one user
M.groups.addRelation('wasCreatedBy', relationTypes.ONE_TO_ONE, M.users);

// Each user can be the creator of 0-N groups
M.users.addRelation('isCreatorOf', relationTypes.ZERO_TO_N, M.groups, 'wasCreatedBy.name')

// Each user can be member in 0-N groups, that can have M members.
M.users.addRelation('isInGroups', relationTypes.N_TO_M, M.groups, 'contains.name');

// Add users
M.users.add({ name: 'Berta' });
M.users.add({ name: 'Anton' });
M.users.add({ name: 'Tillmann' });

// Add cities
M.cities.add({ name: 'Kiew' });
M.cities.add({ name: 'Curacao' });

//console.log(M.users.get('Anton').wasBornIn)

M.users.get('Anton').wasBornIn = 'Kiew';
M.users.get('Berta').wasBornIn = 'Kiew';
M.users.get('Tillmann').wasBornIn = 'Curacao';

relations.use(M.users.get('Anton').wasBornIn, city => {
    console.log(city.name);
});

M.groups.add({ name: 'Spökes' });

M.groups.get('Spökes').wasCreatedBy = 'Anton'

m.mount(document.body, {
    view: vnode => [
        h3('Users'),
        ul(
            M.users.map(user => li(user.name, ' was born in ', JSON.stringify(user.wasBornIn.name), ' together with ', user.wasBornIn.isBirthplaceOf.filter(f=>f.name!==user.name).map(f=>f.name).join(",")||'nobody else'))
        ),
        h3('Cities'),
        ul(
            M.cities.map(city => li(city.name, ' is birthplace of ', JSON.stringify(city.isBirthplaceOf.map(f=>f.name).join(", "))))
        ),
        h3('Groups'),
        ul(
            M.groups.map(group => li(group.name, ' was created by ', JSON.stringify(group.wasCreatedBy.name)))
        ),
        h3('Locations'),
        ul(
            M.locations.map(location => li(location.name, '  ', JSON.stringify(location())))
        ),
        h3('Special'),
        span(relations.use(M.groups.get('Spökes'), group => ['"', group.name, '" was created by someone from "', group.wasCreatedBy.wasBornIn.name, '"'])),
        h3('Debug'),
        pre(JSON.stringify(S, null, 2))
    ]
});
