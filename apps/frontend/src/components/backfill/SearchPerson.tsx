import {
    Combobox,
    HStack,
    Portal,
    Span,
    Spinner,
    useListCollection,
    VStack
} from "@chakra-ui/react";
import type { components } from "@mfskillsearch/typespec";
import ApiClientContext, { REFRESHED } from "../../lib/ApiClient";
import {
    useContext,
    useState
} from "react";
import { useAsync } from "react-use";

interface SearchPersonProps {
    setPerson: (person: components["schemas"]["PFSkillSearch.Models.Person"]) => void;
}

const SearchPerson = ({ setPerson }: SearchPersonProps) => {
    const apiClient = useContext(ApiClientContext);
    const [searchTerm, setSearchTerm] = useState("");
    const { collection, set } = useListCollection<components["schemas"]["PFSkillSearch.Models.Person"]>({
        initialItems: [],
        itemToString: (item) => item.employee_name,
        itemToValue: (item) => item.employee_id,
    });
    const state = useAsync(async () => {
        await apiClient.person.search(searchTerm)
            .then((result) => {
                if (result === REFRESHED) {
                    return;
                } else {
                    set(result as components["schemas"]["PFSkillSearch.Models.Person"][]);
                }
            })
            .catch((error) => {
                console.error("Error fetching person data:", error);
            });
    }, [searchTerm, set]);

    return (
        <VStack
            width="100%"
        >
            <Combobox.Root
                collection={collection}
                placeholder="名前やメールアドレスで検索できます。"
                onInputValueChange={(e) => setSearchTerm(e.inputValue)}
                positioning={{ sameWidth: true, placement: "bottom-start" }}
            >

                <Combobox.Control>
                    <Combobox.Input
                        placeholder="名前、メールアドレスで検索"
                    />
                    <Combobox.IndicatorGroup>
                        <Combobox.ClearTrigger />
                        <Combobox.Trigger />
                    </Combobox.IndicatorGroup>
                </Combobox.Control>
                <Portal>
                    <Combobox.Positioner>
                        <Combobox.Content minW="sw">
                            {state.loading ? (
                                <HStack p="2">
                                    <Spinner size="xs" borderWidth="1px" />
                                    <span>検索中...</span>
                                </HStack>
                            ) : state.error ? (
                                <Span p="2" color="fg.error">
                                    エラーが発生しました {state.error.message}
                                </Span>
                            ) : (
                                collection.items?.map((person) => (
                                    <Combobox.Item key={person.employee_id} item={person}>
                                        <HStack justify="space-between" textStyle="sm">
                                            <Span fontWeight="medium" truncate>
                                                {person.employee_name}
                                            </Span>
                                            <Span color="fg.muted" truncate>
                                                {[
                                                    person.dept_1,
                                                    person.dept_2,
                                                    person.dept_3,
                                                    person.dept_4,
                                                    person.dept_5,
                                                    person.dept_6
                                                ].filter((d) => {
                                                    return d && d.length > 0;
                                                }).join(" / ")}
                                            </Span>
                                        </HStack>
                                        <Combobox.ItemIndicator />
                                    </Combobox.Item>
                                ))
                            )}
                        </Combobox.Content>
                    </Combobox.Positioner>
                </Portal>

            </Combobox.Root>
            {/* <Input
                placeholder="名前を入力してください。"
                bg="#fff"
                borderColor="#ccc"
                borderRadius="3px"
                h="40px"
                fontSize="14px"
                color="#919191"
                fontFamily="'Noto Sans JP', sans-serif"
                onChange={handleInputChange}
            /> */}
        </VStack >
    );
}

export default SearchPerson;