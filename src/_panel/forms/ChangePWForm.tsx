import * as z from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

import { AccountValidation } from "@/lib/validation/AccountValidations";
import { useAccountPWChange } from "@/lib/react-query/queries";
import toast from "react-hot-toast";
import { toastConfig } from "@/constants";
import { useUserContext } from "@/context/AuthContext";
import { Icons } from "@/components/ui/icons";

const ChangePWForm = () => {
  const { setUser, user } = useUserContext();
  const { mutateAsync: accountPWChange, isPending: isLoading } = useAccountPWChange();

  const form = useForm<z.infer<typeof AccountValidation>>({
    resolver: zodResolver(AccountValidation),
    defaultValues: {
      password: "",
      newPassword: "",
      newPasswordConfirm: "",
    } 
  });

  const handlePWChange = async (formData: z.infer<typeof AccountValidation>) => {
    
    const response = await accountPWChange(formData);

    if (response?.errors) {
      toast.error(response.errors[0].detail, toastConfig);
      return;
    }

    toast.success("Password successfully changed", toastConfig);
    form.reset();
    
    setUser({
      ...user, // Spread the existing user details
      pwForceChange: false, // Clear forced password change after success
    });

  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(handlePWChange)}
        className="flex flex-col gap-5 w-full mt-4"
      >
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="shad-form_label">* Current Password:</FormLabel>
              <FormControl>
                <Input type="password" className="shad-input" {...field} />
              </FormControl>
              <FormMessage className="shad-form_message"  />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="newPassword"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="shad-form_label">* New Password:</FormLabel>
              <FormControl>
                <Input type="password" className="shad-input" {...field} />
              </FormControl>
              <FormMessage className="shad-form_message"  />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="newPasswordConfirm"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="shad-form_label">* Confirm New Password :</FormLabel>
              <FormControl>
                <Input type="password" className="shad-input" {...field} />
              </FormControl>
              <FormMessage className="shad-form_message"  />
            </FormItem>
          )}
        />

        <div className="flex justify-end items-center my-5">
          <Button disabled={isLoading} size="lg" className="shad-button mt-3">
          { isLoading && <Icons.spinner className="mr-2 h-4 w-4 animate-spin" /> }
          Update
          </Button>
        </div>

      </form>
    </Form>
  )
}

export default ChangePWForm