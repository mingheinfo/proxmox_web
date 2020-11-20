import 'element-ui/lib/theme-chalk/index.css';
import {
  Table,
  TableColumn,
  Tree,
  Menu,
  Submenu,
  MenuItem,
  MenuItemGroup,
  Input,
  Form,
  FormItem,
  Radio,
  DatePicker,
  Loading
} from 'element-ui';
import MInput from '@src/components/input/mInput';
import MDropdown from '@src/components/dropdown/dropdown';
import MDropdownItem from '@src/components/dropdown/dropdownItem';
import MButton from '@src/components/button/Button';
import Tab from '@src/components/tab/Tab';
import TabPanel from '@src/components/tab/TabPanel';
import Dialog from "@src/components/dialog/Dialog";
import Switch from "@src/components/switch/Switch";
const element = {
  install: (vue) => {
    vue.use(Table);
    vue.use(TableColumn);
    vue.use(Tree);
    vue.use(Menu);
    vue.use(MenuItem);
    vue.use(Submenu);
    vue.use(MenuItemGroup);
    vue.use(Input);
    vue.use(Form);
    vue.use(FormItem);
    vue.component('m-input',MInput);
    vue.component('m-dropdown', MDropdown);
    vue.component('m-dropdown-item', MDropdownItem);
    vue.use(Radio);
    vue.use(DatePicker);
    vue.component('m-button', MButton);
    vue.component('m-tab', Tab);
    vue.component('m-tab-panel', TabPanel);
    vue.component('m-dialog', Dialog);
    vue.component('m-switch', Switch);
    vue.use(Loading);
  }
}

export default element;
