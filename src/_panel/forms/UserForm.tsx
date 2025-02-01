import * as z from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate } from "react-router-dom";
import { 
  Form, 
  FormControl, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { UserValidation } from "@/lib/validation/UserValidations";
import { 
  useAccountAvatarCreate, 
  useAccountAvatarDelete, 
  useAccountAvatars, 
  useAccountUpdate, 
  useCreateUser, 
  useDeleteFile, 
  useEditUser 
} from "@/lib/react-query/queries";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { UserFormProps } from "@/types";
import toast from "react-hot-toast";
import { presetAvatars, toastConfig } from "@/constants";
import { Icons } from "@/components/ui/icons";
import { useModalIsOpen, useModalIsLoading, useModalFileUploadIsOpen } from "@/components/ToggleProvider";
import { useEffect, useState } from "react";
import { Minus, PlusIcon } from "lucide-react";
import Tooltip from "@/components/shared/Tooltip";

import ModalFileUpload from "@/components/ModalFileUpload";
import Loader2 from "@/components/shared/Loader2";

const UserForm: React.FC<UserFormProps> = ({ userId, userData, userAction = "user-create" }) => {
  const navigate = useNavigate();
  const { mutateAsync: createUser, isPending: isCreatingUser } = useCreateUser();
  const { mutateAsync: editUser, isPending: isUpdatingUser } = useEditUser();
  const { mutateAsync: accountUpdate, isPending: isUpdatingAccount } = useAccountUpdate();
  const { mutateAsync: createAvatar, isPending: isCreatingAvatar } = useAccountAvatarCreate();
  const { mutateAsync: deleteAvatar, isPending: isDeletingAvatar } = useAccountAvatarDelete();
  const { mutateAsync: deleteFile, isPending: isDeletingFile } = useDeleteFile();
  const { data: accountAvatars, isLoading: isFetchingAccountAvatars} = useAccountAvatars();
  const [avatars, setAvatars] = useState(presetAvatars);
  
  const { modalFileUploadIsOpen, setModalFileUploadIsOpen } = useModalFileUploadIsOpen();
  const [fileUploaded, setFileUploaded] = useState("");
  const { setModalIsOpen } = useModalIsOpen();
  const { setModalIsLoading } = useModalIsLoading();
  const [selectedAvatar, setSelectedAvatar] = useState<string>(
    userData?.imageUrl || "/assets/avatars/default-avatar.png"
  );

  const isProcessing = isCreatingUser || isUpdatingUser || isUpdatingAccount || isCreatingAvatar;
  
  const form = useForm<z.infer<typeof UserValidation>>({
    resolver: zodResolver(UserValidation),
    defaultValues: userData ? {
      name: userData.name,
      email: userData.email,
      ipWhitelist: userData.ipWhitelist?.join("\n") || "",
      role: userData.role as "admin" | "super", 
      active: userData.active,
      pwForceChange: userData.pwForceChange
    }
    : {
      name: "",
      email: "",
      password: "",
      passwordConfirm: "",
      ipWhitelist: "",
      role: "admin",
      active: true,
      pwForceChange: true
    } 
  });

  const handleSubmitAction = async (formData: z.infer<typeof UserValidation>) => {
    const formDataWithAvatar = {
      ...formData,
      imageUrl: selectedAvatar, // Always submit the selected avatar
    };

    const response = userAction === "account-edit"
    ? await accountUpdate(formDataWithAvatar) : userId 
    ? await editUser({ id: userId, user: formDataWithAvatar })
    : await createUser(formDataWithAvatar);

    if (response?.errors) {
      toast.error(response.errors[0].detail, toastConfig);
      return;
    }

    const successMessage = userAction === "account-edit"
    ? "Account successfully updated" : userId
    ? "User successfully updated"
    : "User successfully created";

    toast.success(successMessage, toastConfig);
    setModalIsOpen(false);
    
    userAction !== "account-edit" && navigate("/panel/users");

  };

  const handleCancel = () => {
    setModalIsOpen(false);
  }

  const handleAvatarClick = (path: string | "") => {
    setSelectedAvatar(path); // Set selected avatar path or null for 'None'
  };

  const handleRemoveCustomAvatar = async (avatarFilePath: string, avatarFileName: string) => {  
    try {
      const [deletedAvatar, deletedFile] = await Promise.all([
        deleteAvatar(avatarFilePath),
        deleteFile([avatarFileName])
      ]);
  
      if (deletedAvatar?.errors) {
        toast.error(deletedAvatar.errors[0].detail, toastConfig);
        return;
      }
  
      if (deletedFile?.errors) {
        toast.error(deletedFile.errors[0].detail, toastConfig);
        return;
      }
      
      // Remove the deleted avatar from the avatars array and update the state
      setAvatars(prevAvatars => 
        prevAvatars.filter(avatar => avatar.fileName !== avatarFileName)
      );

      toast.success("Custom avatar removed", toastConfig);
    } catch (error) {
      toast.error("An error occurred while removing the avatar", toastConfig);
    }
  };

  useEffect(() => {
    setModalIsLoading(isProcessing);
  }, [isProcessing]);
  
  useEffect(() => {
    const createAvatarAsync = async () => {
      if (fileUploaded) {
        try {

          const data = {
            "accountType": "admin",
            "imageUrl": fileUploaded
          }
          
          const response = await createAvatar(data);
  
          if (response?.errors) {
            toast.error(response.errors[0].detail, toastConfig);
            return;
          }
          
          // If successful, append the new avatar to the state
          const newAvatar = {
            fileName: fileUploaded.split("/").pop() || "custom-avatar.png",
            path: fileUploaded,
            preset: false
          };

          setAvatars((prevAvatars) => [...prevAvatars, newAvatar]);
          console.log(avatars)

        } catch (error) {
          toast.error("An error occurred while creating the avatar", toastConfig);
        }
      }
    };
  
    createAvatarAsync();
  }, [fileUploaded]); 

  useEffect(() => {
    if (accountAvatars && userAction === "account-edit") {
      // Append accountAvatars to presetAvatars
      const customAvatars = accountAvatars.map((avatar: { imageUrl: string; }) => ({
        fileName: avatar.imageUrl.split("/").pop() || "custom-avatar.png",
        path: avatar.imageUrl,
        preset: false
      }));

      setAvatars([...presetAvatars, ...customAvatars]);
    }
  }, [accountAvatars]);

  if (isCreatingAvatar || isFetchingAccountAvatars || isDeletingAvatar || isDeletingFile) return <Loader2 />;

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(handleSubmitAction)}
        className="flex flex-col gap-5 w-full mt-4"
      >
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="shad-form_label">* Name:</FormLabel>
              <FormControl>
                <Input type="text" className="shad-input" {...field} />
              </FormControl>
              <FormMessage className="shad-form_message" />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="shad-form_label">* Email:</FormLabel>
              <FormControl>
                <Input type="text" className="shad-input" {...field} />
              </FormControl>
              <FormMessage className="shad-form_message" />
            </FormItem>
          )}
        />


        {userAction === "user-create" && (
          <>
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="shad-form_label">* Password:</FormLabel>
                  <FormControl>
                    <Input type="password" className="shad-input" {...field} />
                  </FormControl>
                  <FormMessage className="shad-form_message"  />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="passwordConfirm"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="shad-form_label">* Confirm Password:</FormLabel>
                  <FormControl>
                    <Input type="password" className="shad-input" {...field} />
                  </FormControl>
                  <FormMessage className="shad-form_message"  />
                </FormItem>
              )}
            />
          </>
        )}

        {userAction !== "account-edit"  && (
          <div className="flex justify-center items-center gap-6">
            <FormField
              control={form.control}
              name="pwForceChange"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-2 space-y-0.5">
                  <FormControl>
                    <Checkbox className="shad-checkbox" checked={field.value} onCheckedChange={field.onChange} />
                  </FormControl>
                  <FormLabel className="ml-2 mb-1 shad-form_label">PW Force Change</FormLabel>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="active"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-2 space-y-0.5">
                  <FormControl>
                    <Checkbox className="shad-checkbox" checked={field.value} onCheckedChange={field.onChange}   />
                  </FormControl>
                  <FormLabel className="ml-2 mb-1 shad-form_label">Active</FormLabel>
                </FormItem>
              )}
            />
          </div>
        )}

        <FormField
          control={form.control}
          name="ipWhitelist"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="shad-form_label">IP White List:</FormLabel>
              <FormControl>
                <Textarea
                  placeholder=""
                  className="shad-textarea"
                  value={field.value || ""}
                  onChange={(e) => field.onChange(e.target.value)}
                  onBlur={field.onBlur}
                />
              </FormControl>
              <FormMessage className="shad-form_message" />
            </FormItem>
          )}
        />

        <div>
          <FormLabel className="shad-form_label">Avatar:</FormLabel>
          <div className="overflow-x-auto w-full">
          <div className="flex items-center gap-2 py-2">
            {avatars.map((avatar) => (
              <div
                key={avatar.fileName}
                className={`group relative cursor-pointer shrink-0 p-2 border-2 rounded-md transition-transform duration-300 ease-in-out ${
                  selectedAvatar === avatar.path ? "border-main -translate-y-1 shadow-sm" : "border-gray-300 dark:border-slate-800"
                }`}
                onClick={() => handleAvatarClick(avatar.path)}
              >
                {!avatar.preset && (
                  <button
                    type="button"
                    className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-4 h-4 flex items-center justify-center text-xs shadow-md hover:bg-red-600 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                    onClick={(e) => {
                      e.stopPropagation(); // Prevent triggering avatar selection
                      handleRemoveCustomAvatar(avatar.path, avatar.fileName);
                    }}
                  >
                    <Minus className="w-3 h-3" />
                  </button>
                )}
                  
                <img src={avatar.path} alt={avatar.fileName} className="w-12 h-12 rounded-full" />
              </div>
            ))}
            {userAction === "account-edit" && (
              <Tooltip message={"Add Custom Avatar"} position="left">
                <button
                  type="button"
                  onClick={() => setModalFileUploadIsOpen(true)}
                  className="cursor-pointer shrink-0 p-2 border-2 rounded-md transition-transform duration-300 ease-in-out text-gray-300"
                >
                  <PlusIcon />
                </button>
              </Tooltip>
            )}
          </div>
          </div>
        </div>

        {userAction !== "account-edit"  && (
          <div className="max-w-[50%]">
            <FormField
              control={form.control}
              name="role"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="shad-form_label">* Role:</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value} >
                    <FormControl>
                      <SelectTrigger  className="shad-select" >
                        <SelectValue placeholder="Choose..." />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent className="shad-select">
                      <SelectItem value="admin">Admin</SelectItem>
                      <SelectItem value="super">Super</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage className="shad-form_message" />
                </FormItem>
              )}
            />
          </div>
        )}
        
        <div className={`flex ${userAction !== "account-edit" ? 'justify-between' : 'justify-end'} items-center my-5`}>
          {userAction !== "account-edit" && (
            <Button type="button" onClick={handleCancel} disabled={isProcessing} size="lg" variant="outline">Cancel</Button>
          )}

          <Button disabled={isProcessing} size="lg" className="shad-button mt-3">
            { isProcessing && <Icons.spinner className="mr-2 h-4 w-4 animate-spin" /> }
            { !userData && !userId ? "Create" : "Update" }
          </Button>
        </div>

        {modalFileUploadIsOpen && (
          <ModalFileUpload setFileUploaded={setFileUploaded} />
        )}

      </form>
    </Form>
  )
}

export default UserForm
