import { configure } from 'enzyme';
const Adapter = require("enzyme-adapter-react-16");

import "babel-polyfill";
import "./src/extend";

configure({ adapter: new Adapter() });