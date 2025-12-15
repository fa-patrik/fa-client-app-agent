import { Form } from "@formio/react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { useFormioStyles } from "./useFormioStyles";

/**
 * Formio Forms - Visual testing for form styling
 *
 * These stories demonstrate various Formio form components with the
 * official Bootstrap + Bootstrap Icons + Formio styling approach.
 *
 * Styles are loaded dynamically to prevent leakage to other components.
 */

// Wrapper component that loads styles for Storybook
const FormWithStyles = (props: React.ComponentProps<typeof Form>) => {
  useFormioStyles();
  return <Form {...props} />;
};

const meta = {
  title: "UX/Formio",
  component: FormWithStyles,
  parameters: {
    layout: "padded",
  },
} satisfies Meta<typeof FormWithStyles>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * Basic form with common input types
 */
export const BasicInputs: Story = {
  args: {
    form: {
      display: "form",
      components: [
        {
          label: "Text Field",
          tableView: true,
          key: "textField",
          type: "textfield",
          input: true,
          placeholder: "Enter text here",
        },
        {
          label: "Email",
          tableView: true,
          key: "email",
          type: "email",
          input: true,
          placeholder: "user@example.com",
        },
        {
          label: "Phone Number",
          tableView: true,
          key: "phoneNumber",
          type: "phoneNumber",
          input: true,
        },
        {
          label: "Number",
          tableView: true,
          key: "number",
          type: "number",
          input: true,
        },
        {
          label: "Text Area",
          tableView: true,
          key: "textArea",
          type: "textarea",
          input: true,
          rows: 3,
        },
        {
          type: "button",
          label: "Submit",
          key: "submit",
          disableOnInvalid: true,
          input: true,
          tableView: false,
        },
      ],
    },
  },
};

/**
 * Select dropdowns and choices
 */
export const SelectComponents: Story = {
  args: {
    form: {
      display: "form",
      components: [
        {
          label: "Select",
          widget: "choicesjs",
          tableView: true,
          data: {
            values: [
              { label: "Option 1", value: "option1" },
              { label: "Option 2", value: "option2" },
              { label: "Option 3", value: "option3" },
            ],
          },
          key: "select",
          type: "select",
          input: true,
        },
        {
          label: "Radio",
          optionsLabelPosition: "right",
          inline: false,
          tableView: false,
          values: [
            { label: "Choice 1", value: "choice1" },
            { label: "Choice 2", value: "choice2" },
            { label: "Choice 3", value: "choice3" },
          ],
          key: "radio",
          type: "radio",
          input: true,
        },
        {
          label: "Checkbox",
          tableView: false,
          key: "checkbox",
          type: "checkbox",
          input: true,
        },
        {
          type: "button",
          label: "Submit",
          key: "submit",
          disableOnInvalid: true,
          input: true,
          tableView: false,
        },
      ],
    },
  },
};

/**
 * Date and time components
 */
export const DateTimeComponents: Story = {
  args: {
    form: {
      display: "form",
      components: [
        {
          label: "Date / Time",
          tableView: false,
          datePicker: {
            disableWeekends: false,
            disableWeekdays: false,
          },
          enableMinDateInput: false,
          enableMaxDateInput: false,
          key: "dateTime",
          type: "datetime",
          input: true,
          widget: {
            type: "calendar",
            displayInTimezone: "viewer",
            locale: "en",
            useLocaleSettings: false,
            allowInput: true,
            mode: "single",
            enableTime: true,
            noCalendar: false,
            format: "yyyy-MM-dd hh:mm a",
            hourIncrement: 1,
            minuteIncrement: 1,
            time_24hr: false,
            minDate: null,
            disableWeekends: false,
            disableWeekdays: false,
            maxDate: null,
          },
        },
        {
          label: "Day",
          hideInputLabels: false,
          inputsLabelPosition: "top",
          useLocaleSettings: false,
          tableView: false,
          fields: {
            day: {
              hide: false,
            },
            month: {
              hide: false,
            },
            year: {
              hide: false,
            },
          },
          key: "day",
          type: "day",
          input: true,
          defaultValue: "00/00/0000",
        },
        {
          type: "button",
          label: "Submit",
          key: "submit",
          disableOnInvalid: true,
          input: true,
          tableView: false,
        },
      ],
    },
  },
};

/**
 * Tabs layout component
 */
export const TabsLayout: Story = {
  args: {
    form: {
      display: "form",
      components: [
        {
          label: "Tabs",
          components: [
            {
              label: "Tab 1",
              key: "tab1",
              components: [
                {
                  label: "Field in Tab 1",
                  tableView: true,
                  key: "fieldInTab1",
                  type: "textfield",
                  input: true,
                },
              ],
            },
            {
              label: "Tab 2",
              key: "tab2",
              components: [
                {
                  label: "Field in Tab 2",
                  tableView: true,
                  key: "fieldInTab2",
                  type: "textfield",
                  input: true,
                },
              ],
            },
            {
              label: "Tab 3",
              key: "tab3",
              components: [
                {
                  label: "Field in Tab 3",
                  tableView: true,
                  key: "fieldInTab3",
                  type: "textfield",
                  input: true,
                },
              ],
            },
          ],
          key: "tabs",
          type: "tabs",
          input: false,
          tableView: false,
        },
        {
          type: "button",
          label: "Submit",
          key: "submit",
          disableOnInvalid: true,
          input: true,
          tableView: false,
        },
      ],
    },
  },
};

/**
 * Form with validation and error states
 */
export const ValidationStates: Story = {
  args: {
    form: {
      display: "form",
      components: [
        {
          label: "Required Field",
          tableView: true,
          validate: {
            required: true,
          },
          key: "requiredField",
          type: "textfield",
          input: true,
        },
        {
          label: "Email (with validation)",
          tableView: true,
          validate: {
            required: true,
          },
          key: "emailValidation",
          type: "email",
          input: true,
        },
        {
          label: "Minimum Length (5 chars)",
          tableView: true,
          validate: {
            minLength: 5,
          },
          key: "minLength",
          type: "textfield",
          input: true,
        },
        {
          label: "Number Range (1-100)",
          tableView: true,
          validate: {
            min: 1,
            max: 100,
          },
          key: "numberRange",
          type: "number",
          input: true,
        },
        {
          type: "button",
          label: "Submit",
          key: "submit",
          disableOnInvalid: true,
          input: true,
          tableView: false,
        },
      ],
    },
  },
};

/**
 * Comprehensive form with all component types
 */
export const ComprehensiveForm: Story = {
  args: {
    form: {
      display: "form",
      components: [
        {
          label: "Tabs",
          components: [
            {
              label: "Basic Info",
              key: "basicInfo",
              components: [
                {
                  label: "Full Name",
                  tableView: true,
                  validate: {
                    required: true,
                  },
                  key: "fullName",
                  type: "textfield",
                  input: true,
                },
                {
                  label: "Email",
                  tableView: true,
                  validate: {
                    required: true,
                  },
                  key: "email",
                  type: "email",
                  input: true,
                },
                {
                  label: "Country",
                  widget: "choicesjs",
                  tableView: true,
                  data: {
                    values: [
                      { label: "United States", value: "us" },
                      { label: "United Kingdom", value: "uk" },
                      { label: "Germany", value: "de" },
                      { label: "France", value: "fr" },
                    ],
                  },
                  validate: {
                    required: true,
                  },
                  key: "country",
                  type: "select",
                  input: true,
                },
              ],
            },
            {
              label: "Additional Details",
              key: "additionalDetails",
              components: [
                {
                  label: "Date of Birth",
                  tableView: false,
                  enableMinDateInput: false,
                  enableMaxDateInput: false,
                  key: "dateOfBirth",
                  type: "datetime",
                  input: true,
                  widget: {
                    type: "calendar",
                    displayInTimezone: "viewer",
                    locale: "en",
                    useLocaleSettings: false,
                    allowInput: true,
                    mode: "single",
                    enableTime: false,
                    noCalendar: false,
                    format: "yyyy-MM-dd",
                  },
                },
                {
                  label: "Comments",
                  tableView: true,
                  key: "comments",
                  type: "textarea",
                  input: true,
                  rows: 4,
                },
                {
                  label: "I agree to terms and conditions",
                  tableView: false,
                  validate: {
                    required: true,
                  },
                  key: "agreeToTerms",
                  type: "checkbox",
                  input: true,
                },
              ],
            },
          ],
          key: "tabs",
          type: "tabs",
          input: false,
          tableView: false,
        },
        {
          type: "button",
          label: "Submit",
          key: "submit",
          disableOnInvalid: true,
          input: true,
          tableView: false,
          theme: "primary",
        },
      ],
    },
  },
};
