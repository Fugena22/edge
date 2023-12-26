import notion from "@/lib/notion";

export async function POST(request: Request) {
  const user = await request.json();

  const newRow = {
    parent: {
      database_id: process.env.NOTION_TEST_DATABASE_ID!,
    },
    properties: {
      Name: {
        title: [
          {
            text: {
              content: user.name,
            },
          },
        ],
      },

      URL: {
        rich_text: [
          {
            text: {
              content: user.url,
            },
          },
        ],
      },
    },
  };

  try {
    const response = await notion.pages.create(newRow);

    return new Response("OK");
  } catch (error) {
    return new Response("Something Went Wrong", { status: 500 });
  }
}
