Fix the Sign Up form in src/app/(auth)/login/page.tsx completely.

THE PROBLEM: Fields are too narrow — label and input are side by side 
in small boxes. Fix by making everything full width stacked layout.

RULES:
1. LAYOUT — Change ALL fields from flex-row layout to stacked layout:
   - Label: full width, on top (block text-sm font-medium text-gray-700 mb-1)
   - Input: full width below label (w-full rounded-xl border border-gray-200 
     px-4 py-3 text-sm)
   - Each field wrapped in: <div className="mb-4 w-full">

2. USER ID FIELD — Fixed prefix:
   <div className="flex rounded-xl border border-gray-200 overflow-hidden">
     <span className="px-4 py-3 bg-gray-100 text-gray-500 text-sm 
                      border-r border-gray-200 font-medium select-none 
                      whitespace-nowrap">IPDC-</span>
     <input type="text" 
            className="flex-1 px-3 py-3 text-sm focus:outline-none bg-white"
            placeholder="Enter employee number" />
   </div>
   The "IPDC-" prefix is NOT editable. User types number only after it.
   On form submit, combine: "IPDC-" + inputValue

3. MOBILE NO FIELD — Fixed prefix:
   Same pattern as User ID:
   <div className="flex rounded-xl border border-gray-200 overflow-hidden">
     <span className="px-4 py-3 bg-gray-100 text-gray-500 text-sm 
                      border-r border-gray-200 font-medium select-none
                      whitespace-nowrap">+88</span>
     <input type="tel"
            className="flex-1 px-3 py-3 text-sm focus:outline-none bg-white"
            placeholder="01XXXXXXXXX" />
   </div>
   The "+88" is NOT editable. On submit combine: "+88" + inputValue

4. ALL OTHER FIELDS — Full width stacked:
   Name → w-full text input
   Email ID → w-full email input
   Designation → w-full text input
   Seniority → w-full select dropdown
   Department → w-full select dropdown
   Employee Type → w-full select dropdown
   Supervisor → w-full text input
   Team Leader → w-full text input

5. SUBMIT BUTTON:
   w-full py-3 rounded-xl bg-[#232B2B] text-white font-semibold
   hover:bg-white hover:text-[#232B2B] hover:border hover:border-[#232B2B]
   transition-all duration-200

6. CONTAINER WIDTH:
   The sign up form container should be w-full max-w-sm mx-auto
   with overflow-y-auto max-h-[70vh] for scrolling on small screens

7. SIGN IN / SIGN UP TABS — Make wider:
   Container: w-full bg-gray-100 p-1 rounded-full flex mb-6
   Each tab: flex-1 text-center py-2 text-sm font-medium rounded-full
   Active: bg-white shadow text-gray-800
   Inactive: text-gray-400

After changes:
- Run npm run dev
- Check npx tsc --noEmit
- Fix all TypeScript errors
- No any types