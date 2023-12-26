"use client";
import { Button } from "@/components/ui/button";
import { SingleImageDropzone } from "@/components/ui/dropzone";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useEdgeStore } from "@/lib/edgestore";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import axios from "axios";
import { Loader2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

const MAX_FILE_SIZE = 50000;
const ACCEPTED_IMAGE_TYPES = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
];

const formSchema = z.object({
  name: z.string(),
  image: z
    .any()
    .refine((file) => !!file, "Image is required.")
    .refine((file) => file.size <= MAX_FILE_SIZE, `Max file size is 5MB.`)
    .refine(
      (file) => ACCEPTED_IMAGE_TYPES.includes(file.type),
      ".jpg, .jpeg, .png and .webp files are accepted."
    ),
});

interface Test {
  name: string;
  url: string;
}

export default function TestForm() {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
    },
  });
  const { edgestore } = useEdgeStore();

  const { mutate: mutateSubmit, isPending: isSubmitting } = useMutation({
    mutationFn: (test: Test) => axios.post("/api/test", test),
    onMutate: () => {
      toast.success("Bạn đã đăng ký thành công!");
      form.reset();
    },
  });

  async function onSubmit(data: z.infer<typeof formSchema>) {
    // Upload file to EdgeStore
    if (data.image) {
      const res = await edgestore.publicFiles.upload({
        file: data.image,
        onProgressChange: (progress) => {
          console.log(progress);
        },
      });
      const fileUrl = res.url;

      mutateSubmit({
        name: data.name,
        url: fileUrl,
      });
    }
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="space-y-8 bg-[#F8F9FA] px-6 py-10 rounded-md"
      >
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Họ và tên</FormLabel>
              <FormControl>
                <Input
                  placeholder="Họ và tên"
                  {...field}
                  disabled={form.formState.isSubmitting}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="image"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Họ và tên</FormLabel>
              <FormControl>
                <SingleImageDropzone
                  width={200}
                  height={200}
                  {...field}
                  disabled={form.formState.isSubmitting}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button
          type="submit"
          className="mx-auto"
          disabled={form.formState.isSubmitting}
        >
          {form.formState.isSubmitting && (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          )}
          Submit
        </Button>
      </form>
    </Form>
  );
}
