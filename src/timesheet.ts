import path from "path";
import { CheckoutRecord } from "./record-model";
import { TimeSheet } from "./timesheet-models";
import * as fs from "fs";
import * as XLSX from "xlsx";

const { compile } = require("html-to-text");
const { convert } = require("html-to-text");
const options = {
  wordwrap: 130,
};

const requestData = async (url: string): Promise<CheckoutRecord[]> => {
  try {
    const options: RequestInit = {
      headers: {
        // put your cookie here
        Cookie: "",
      },
    };
    const response = await fetch(url, options);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    const formattedData: CheckoutRecord[] = data.map((item: any) => ({
      id: item.id,
      status: item.status,
      visible_to_clients: item.visible_to_clients,
      created_at: item.created_at,
      updated_at: item.updated_at,
      title: item.title,
      inherits_status: item.inherits_status,
      type: item.type,
      url: item.url,
      app_url: item.app_url,
      bookmark_url: item.bookmark_url,
      subscription_url: item.subscription_url,
      comments_count: item.comments_count,
      comments_url: item.comments_url,
      parent: {
        id: item.parent.id,
        title: item.parent.title,
        type: item.parent.type,
        url: item.parent.url,
        app_url: item.parent.app_url,
      },
      bucket: {
        id: item.bucket.id,
        name: item.bucket.name,
        app_url: item.bucket.app_url,
        type: item.bucket.type,
      },
      creator: {
        id: item.creator.id,
        attachable_sgid: item.creator.attachable_sgid,
        name: item.creator.name,
        email_address: item.creator.email_address,
        personable_type: item.creator.personable_type,
        title: item.creator.title,
        bio: item.creator.bio,
        location: item.creator.location,
        created_at: item.creator.created_at,
        updated_at: item.creator.updated_at,
        admin: item.creator.admin,
        owner: item.creator.owner,
        client: item.creator.client,
        employee: item.creator.employee,
        time_zone: item.creator.time_zone,
        avatar_url: item.creator.avatar_url,
        avatar_kind: item.creator.avatar_kind,
        company: {
          id: item.creator.company.id,
          name: item.creator.company.name,
        },
        can_ping: item.creator.can_ping,
        can_manage_projects: item.creator.can_manage_projects,
        can_manage_people: item.creator.can_manage_people,
        can_access_timesheet: item.creator.can_access_timesheet,
      },
      content: item.content,
      group_on: item.group_on,
    }));

    const filterCheckout = formattedData.filter((checkout) => {
      const checkoutDate = new Date(checkout.group_on);
      const thisMonth = new Date();

      return (
        checkoutDate.getMonth() == thisMonth.getMonth() &&
        checkout.creator.email_address == "chonnakan@odds.team"
      );
    });
    return filterCheckout;
  } catch (error) {
    console.error("Error fetching data:", error);
    return [];
  }
};

const extractContent = (allCheckout: CheckoutRecord[]): TimeSheet[] => {
  const mapCheckout: TimeSheet[] = allCheckout.map((checkout) => ({
    date: checkout.group_on,
    checkout: extractToday(convert(checkout.content, options)),
  }));

  const sortedCheckout: TimeSheet[] = mapCheckout.sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  return sortedCheckout;
};

const extractToday = (content: string): string => {
  const templateMatch = content.match(
    /Today:\n([\s\S]*?)(?=\n(?:Stuck|Tomorrow|$))/
  );
  if (templateMatch) {
    const todayCheckout = templateMatch[1].trim();
    if (todayCheckout) {
      return todayCheckout;
    }
  }

  console.log("content template not match");
  return "";
};

const saveCheckoutToExel = (checkouts: TimeSheet[]) => {
  console.log("beginning to save excel");

  const worksheet: XLSX.WorkSheet = XLSX.utils.json_to_sheet(checkouts);
  // set column width
  worksheet["!cols"] = [{ wpx: 200 }, { wpx: 400 }];
  const workbook: XLSX.WorkBook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "chonnakan");

  XLSX.writeFile(workbook, "timesheet.xlsx");

  console.log("save successful");
};

let page = 1;
const fetchCheckout = async () => {
  let allCheckout: CheckoutRecord[] = [];
  while (true) {
    // set your basecamp url you want to fetch
    const url = `https://3.basecamp.com/4877526/buckets/35942924/questions/7130203005/answers.json?page=${page}`;
    console.log(`fetching page ${page}`);
    const checkoutData = await requestData(url);

    if (checkoutData.length === 0) {
      break;
    }

    allCheckout.push(...checkoutData);
    page++;
  }

  const checkouts = extractContent(allCheckout);

  saveCheckoutToExel(checkouts);

  // * for testing write data to file
  // const fileContent = contents
  //   .map((commit) => commit.checkout)
  //   .join("\n\n==========================\n");
  // const filePath = path.resolve(process.cwd(), "timesheet.txt");
  // fs.writeFileSync(filePath, fileContent);
};

fetchCheckout();
