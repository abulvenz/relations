// jshint esversion: 6

import m from 'mithril';
import { collection } from './relations';
import { img, li, ul } from './tags';


const state = {
    users: []
};

const model = {
    users: collection(state.users,{})
};

model.users.add({name: 'Anton'});
model.users.add({name: 'Berta'});



m.mount(document.body, {
    view:vnode=>[
            ul(
                model.users.pluck('name').map(name=>li(name))
            ),
            img()
    ]
});
