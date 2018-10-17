import { configure } from 'enzyme';
const Adapter = require("enzyme-adapter-react-16");

import "babel-polyfill";

configure({ adapter: new Adapter() });